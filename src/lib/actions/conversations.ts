"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getOrCreateConversation } from "@/lib/conversations/get-or-create";

export async function startConversationWithUser(otherUserId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/connexion");
  }

  if (user.id === otherUserId) {
    redirect("/messages");
  }

  const conversationId = await getOrCreateConversation(supabase, user.id, otherUserId);

  redirect(conversationId ? `/messages/${conversationId}` : "/messages");
}
