import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";

export async function createNotification(
  supabase: SupabaseClient<Database>,
  {
    userId,
    type,
    title,
    body,
    interventionId,
  }: {
    userId: string;
    type: string;
    title: string;
    body?: string;
    interventionId: string;
  },
) {
  const { error } = await supabase.from("notifications").insert({
    user_id: userId,
    type,
    title,
    body,
    intervention_id: interventionId,
  });

  if (error) {
    console.error("createNotification:", error.message);
  }
}
