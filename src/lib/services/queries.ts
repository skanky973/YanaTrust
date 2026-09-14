import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Service } from "@/lib/supabase/database.types";

export type ServiceWithProvider = Service & {
  provider: {
    first_name: string;
    last_name: string;
    city: string | null;
  } | null;
};

export async function getActiveServices({
  category,
  search,
}: {
  category?: string;
  search?: string;
} = {}): Promise<ServiceWithProvider[]> {
  const supabase = await createClient();

  let query = supabase
    .from("services")
    .select("*, provider:profiles(first_name, last_name, city)")
    .eq("status", "active")
    .order("created_at", { ascending: false });

  if (category) {
    query = query.eq("category", category);
  }

  if (search) {
    query = query.ilike("title", `%${search}%`);
  }

  const { data, error } = await query;

  if (error) {
    console.error("getActiveServices:", error.message);
    return [];
  }

  return data as unknown as ServiceWithProvider[];
}

export async function getServiceById(
  id: string,
): Promise<ServiceWithProvider | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("services")
    .select("*, provider:profiles(first_name, last_name, city)")
    .eq("id", id)
    .single();

  if (error) {
    console.error("getServiceById:", error.message);
    return null;
  }

  return data as unknown as ServiceWithProvider;
}

export async function getMyServices(): Promise<Service[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data, error } = await supabase
    .from("services")
    .select("*")
    .eq("provider_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getMyServices:", error.message);
    return [];
  }

  return data;
}
