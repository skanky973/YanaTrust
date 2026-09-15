import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { ServiceRequest, RequestPhoto } from "@/lib/supabase/database.types";

export type RequestWithClient = ServiceRequest & {
  client: { id: string; first_name: string; last_name: string } | null;
};

export async function getOpenRequests({
  category,
  search,
}: {
  category?: string;
  search?: string;
} = {}): Promise<RequestWithClient[]> {
  const supabase = await createClient();

  let query = supabase
    .from("requests")
    .select("*, client:profiles!requests_client_id_fkey(id, first_name, last_name)")
    .eq("status", "open")
    .order("created_at", { ascending: false });

  if (category) query = query.eq("category", category);
  if (search) query = query.ilike("title", `%${search}%`);

  const { data, error } = await query;

  if (error) {
    console.error("getOpenRequests:", error.message);
    return [];
  }

  return data as unknown as RequestWithClient[];
}

export async function getRequestById(id: string): Promise<RequestWithClient | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("requests")
    .select("*, client:profiles!requests_client_id_fkey(id, first_name, last_name)")
    .eq("id", id)
    .single();

  if (error) {
    console.error("getRequestById:", error.message);
    return null;
  }

  return data as unknown as RequestWithClient;
}

export async function getRequestPhotos(requestId: string): Promise<RequestPhoto[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("request_photos")
    .select("*")
    .eq("request_id", requestId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("getRequestPhotos:", error.message);
    return [];
  }

  return data;
}

export async function getRequestPhotoUrls(
  requestId: string,
): Promise<{ id: string; url: string }[]> {
  const supabase = await createClient();
  const photos = await getRequestPhotos(requestId);

  const results = await Promise.all(
    photos.map(async (photo) => {
      const { data } = await supabase.storage
        .from("request-photos")
        .createSignedUrl(photo.path, 3600);
      return { id: photo.id, url: data?.signedUrl ?? "" };
    }),
  );

  return results.filter((p) => p.url);
}

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
