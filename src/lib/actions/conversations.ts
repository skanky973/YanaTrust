"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

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

  const { data: existing } = await supabase
    .from("conversations")
    .select("id")
    .or(
      `and(participant_one.eq.${user.id},participant_two.eq.${otherUserId}),and(participant_one.eq.${otherUserId},participant_two.eq.${user.id})`,
    )
    .maybeSingle();

  if (existing) {
    redirect(`/messages/${existing.id}`);
  }

  const { data: created, error } = await supabase
    .from("conversations")
    .insert({ participant_one: user.id, participant_two: otherUserId })
    .select("id")
    .single();

  if (error || !created) {
    // Condition de course probable : une conversation vient d'être créée en
    // parallèle. L'index unique l'empêche d'exister en double, on la relit.
    const { data: retry } = await supabase
      .from("conversations")
      .select("id")
      .or(
        `and(participant_one.eq.${user.id},participant_two.eq.${otherUserId}),and(participant_one.eq.${otherUserId},participant_two.eq.${user.id})`,
      )
      .maybeSingle();

    if (retry) {
      redirect(`/messages/${retry.id}`);
    }

    redirect("/messages");
  }

  redirect(`/messages/${created.id}`);
}
