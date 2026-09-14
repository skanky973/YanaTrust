"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import type { ActionState } from "@/lib/actions/action-state";

const messageSchema = z.object({
  content: z.string().trim().min(1).max(4000),
});

export async function sendMessage(
  conversationId: string,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = messageSchema.safeParse({ content: formData.get("content") });

  if (!parsed.success) {
    return { error: "Message invalide." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Vous devez être connecté." };
  }

  // La policy RLS "Participants can send messages in their conversations"
  // rejette l'insertion si l'utilisateur ne fait pas partie de la conversation.
  const { error } = await supabase.from("messages").insert({
    conversation_id: conversationId,
    sender_id: user.id,
    content: parsed.data.content,
  });

  if (error) {
    return { error: "Impossible d'envoyer le message." };
  }

  return { success: true };
}
