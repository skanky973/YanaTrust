import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";

export async function getOrCreateConversation(
  supabase: SupabaseClient<Database>,
  userId: string,
  otherUserId: string,
): Promise<string | null> {
  const { data: existing } = await supabase
    .from("conversations")
    .select("id")
    .or(
      `and(participant_one.eq.${userId},participant_two.eq.${otherUserId}),and(participant_one.eq.${otherUserId},participant_two.eq.${userId})`,
    )
    .maybeSingle();

  if (existing) return existing.id;

  const { data: created, error } = await supabase
    .from("conversations")
    .insert({ participant_one: userId, participant_two: otherUserId })
    .select("id")
    .single();

  if (!error && created) return created.id;

  // Condition de course probable : une conversation vient d'être créée en
  // parallèle. L'index unique l'empêche d'exister en double, on la relit.
  const { data: retry } = await supabase
    .from("conversations")
    .select("id")
    .or(
      `and(participant_one.eq.${userId},participant_two.eq.${otherUserId}),and(participant_one.eq.${otherUserId},participant_two.eq.${userId})`,
    )
    .maybeSingle();

  return retry?.id ?? null;
}
