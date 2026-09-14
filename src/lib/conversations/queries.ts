import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Conversation, Message } from "@/lib/supabase/database.types";

export type ConversationWithPreview = Conversation & {
  otherParticipant: { id: string; first_name: string; last_name: string } | null;
  lastMessage: Message | null;
};

function otherParticipantId(conversation: Conversation, userId: string) {
  return conversation.participant_one === userId
    ? conversation.participant_two
    : conversation.participant_one;
}

export async function getMyConversations(): Promise<ConversationWithPreview[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data: conversations, error } = await supabase
    .from("conversations")
    .select("*")
    .or(`participant_one.eq.${user.id},participant_two.eq.${user.id}`)
    .order("updated_at", { ascending: false });

  if (error || !conversations || conversations.length === 0) {
    if (error) console.error("getMyConversations:", error.message);
    return [];
  }

  const otherIds = [...new Set(conversations.map((c) => otherParticipantId(c, user.id)))];
  const conversationIds = conversations.map((c) => c.id);

  const [{ data: profiles }, { data: messages }] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, first_name, last_name")
      .in("id", otherIds),
    supabase
      .from("messages")
      .select("*")
      .in("conversation_id", conversationIds)
      .order("created_at", { ascending: false }),
  ]);

  const profileById = new Map((profiles ?? []).map((p) => [p.id, p]));
  const lastMessageByConversation = new Map<string, Message>();
  for (const message of messages ?? []) {
    if (!lastMessageByConversation.has(message.conversation_id)) {
      lastMessageByConversation.set(message.conversation_id, message);
    }
  }

  return conversations.map((conversation) => ({
    ...conversation,
    otherParticipant: profileById.get(otherParticipantId(conversation, user.id)) ?? null,
    lastMessage: lastMessageByConversation.get(conversation.id) ?? null,
  }));
}

export async function getConversationForCurrentUser(conversationId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: conversation, error } = await supabase
    .from("conversations")
    .select("*")
    .eq("id", conversationId)
    .single();

  if (error || !conversation) return null;

  // Défense en profondeur : la policy RLS garantit déjà que la ligne ne
  // remonte que si l'utilisateur est participant, mais on vérifie aussi ici.
  if (
    conversation.participant_one !== user.id &&
    conversation.participant_two !== user.id
  ) {
    return null;
  }

  const { data: otherParticipant } = await supabase
    .from("profiles")
    .select("id, first_name, last_name")
    .eq("id", otherParticipantId(conversation, user.id))
    .single();

  const { data: messages } = await supabase
    .from("messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  return {
    conversation,
    currentUserId: user.id,
    otherParticipant: otherParticipant ?? null,
    messages: messages ?? [],
  };
}
