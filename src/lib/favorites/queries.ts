import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Profile, Service } from "@/lib/supabase/database.types";

export async function isProviderFavorited(providerId: string): Promise<boolean> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return false;

  const { data } = await supabase
    .from("favorite_providers")
    .select("provider_id")
    .eq("user_id", user.id)
    .eq("provider_id", providerId)
    .maybeSingle();

  return !!data;
}

export async function isServiceFavorited(serviceId: string): Promise<boolean> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return false;

  const { data } = await supabase
    .from("favorite_services")
    .select("service_id")
    .eq("user_id", user.id)
    .eq("service_id", serviceId)
    .maybeSingle();

  return !!data;
}

export async function getMyFavorites(): Promise<{
  providers: Profile[];
  services: Service[];
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { providers: [], services: [] };

  const [{ data: favProviders }, { data: favServices }] = await Promise.all([
    supabase
      .from("favorite_providers")
      .select("provider_id")
      .eq("user_id", user.id),
    supabase
      .from("favorite_services")
      .select("service_id")
      .eq("user_id", user.id),
  ]);

  const providerIds = (favProviders ?? []).map((f) => f.provider_id);
  const serviceIds = (favServices ?? []).map((f) => f.service_id);

  const [{ data: providers }, { data: services }] = await Promise.all([
    providerIds.length
      ? supabase.from("profiles").select("*").in("id", providerIds)
      : Promise.resolve({ data: [] as Profile[] }),
    serviceIds.length
      ? supabase.from("services").select("*").in("id", serviceIds)
      : Promise.resolve({ data: [] as Service[] }),
  ]);

  return { providers: providers ?? [], services: services ?? [] };
}
