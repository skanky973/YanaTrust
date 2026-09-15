import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { RequestApplication } from "@/lib/supabase/database.types";

export type ApplicationWithProvider = RequestApplication & {
  provider: {
    id: string;
    first_name: string;
    last_name: string;
    bio: string | null;
    is_provider: boolean;
    identity_verified: boolean;
  } | null;
};

export type ApplicationWithRequest = RequestApplication & {
  request: { id: string; title: string; status: string } | null;
};

export async function getApplicationsForRequest(
  requestId: string,
): Promise<ApplicationWithProvider[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("request_applications")
    .select(
      "*, provider:profiles!request_applications_provider_id_fkey(id, first_name, last_name, bio, is_provider, identity_verified)",
    )
    .eq("request_id", requestId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getApplicationsForRequest:", error.message);
    return [];
  }

  return data as unknown as ApplicationWithProvider[];
}

export async function getMyApplication(
  requestId: string,
): Promise<RequestApplication | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data } = await supabase
    .from("request_applications")
    .select("*")
    .eq("request_id", requestId)
    .eq("provider_id", user.id)
    .maybeSingle();

  return data;
}

export async function getMyApplications(): Promise<ApplicationWithRequest[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data, error } = await supabase
    .from("request_applications")
    .select("*, request:requests(id, title, status)")
    .eq("provider_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getMyApplications:", error.message);
    return [];
  }

  return data as unknown as ApplicationWithRequest[];
}

export async function getApplicationCountsForRequests(
  requestIds: string[],
): Promise<Record<string, number>> {
  if (requestIds.length === 0) return {};

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("request_applications")
    .select("request_id")
    .in("request_id", requestIds);

  if (error) {
    console.error("getApplicationCountsForRequests:", error.message);
    return {};
  }

  const counts: Record<string, number> = {};
  for (const row of data) {
    counts[row.request_id] = (counts[row.request_id] ?? 0) + 1;
  }
  return counts;
}

export async function getApplicationByConversationId(
  conversationId: string,
): Promise<RequestApplication | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("request_applications")
    .select("*")
    .eq("conversation_id", conversationId)
    .maybeSingle();

  return data;
}

export async function getApplicationById(
  id: string,
): Promise<RequestApplication | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("request_applications")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("getApplicationById:", error.message);
    return null;
  }

  return data;
}
