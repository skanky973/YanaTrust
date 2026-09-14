import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { ServiceRequest } from "@/lib/supabase/database.types";

export async function getMyRequests(): Promise<ServiceRequest[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data, error } = await supabase
    .from("requests")
    .select("*")
    .eq("client_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getMyRequests:", error.message);
    return [];
  }

  return data;
}
