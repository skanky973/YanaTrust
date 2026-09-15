"use server";

import { createClient } from "@/lib/supabase/server";

export type ClientSearchResult = {
  id: string;
  first_name: string;
  last_name: string;
  city: string | null;
};

export async function searchClients(query: string): Promise<ClientSearchResult[]> {
  if (query.trim().length < 2) return [];

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data, error } = await supabase
    .from("profiles")
    .select("id, first_name, last_name, city")
    .neq("id", user.id)
    .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%`)
    .limit(8);

  if (error) {
    console.error("searchClients:", error.message);
    return [];
  }

  return data;
}
