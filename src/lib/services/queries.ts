import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Service, ServicePhoto } from "@/lib/supabase/database.types";

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
    .select("*, provider:profiles!services_provider_id_fkey(first_name, last_name, city)")
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
    .select("*, provider:profiles!services_provider_id_fkey(first_name, last_name, city)")
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

export async function getActiveServicesByProvider(
  providerId: string,
): Promise<Service[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("services")
    .select("*")
    .eq("provider_id", providerId)
    .eq("status", "active")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getActiveServicesByProvider:", error.message);
    return [];
  }

  return data;
}

export async function getServicePhotos(
  serviceId: string,
): Promise<ServicePhoto[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("service_photos")
    .select("*")
    .eq("service_id", serviceId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("getServicePhotos:", error.message);
    return [];
  }

  return data;
}

export async function getCoverPhotoByService(
  serviceIds: string[],
): Promise<Map<string, string>> {
  if (serviceIds.length === 0) return new Map();

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("service_photos")
    .select("service_id, url, created_at")
    .in("service_id", serviceIds)
    .order("created_at", { ascending: true });

  if (error || !data) {
    if (error) console.error("getCoverPhotoByService:", error.message);
    return new Map();
  }

  const coverByService = new Map<string, string>();
  for (const photo of data) {
    if (!coverByService.has(photo.service_id)) {
      coverByService.set(photo.service_id, photo.url);
    }
  }

  return coverByService;
}
