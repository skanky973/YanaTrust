import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Intervention, InterventionStatusHistory } from "@/lib/supabase/database.types";

export type InterventionWithParties = Intervention & {
  client: { id: string; first_name: string; last_name: string; phone: string | null } | null;
  provider: { id: string; first_name: string; last_name: string } | null;
};

const PARTIES_SELECT =
  "*, client:profiles!interventions_client_id_fkey(id, first_name, last_name, phone), provider:profiles!interventions_provider_id_fkey(id, first_name, last_name)";

export async function getMyInterventionsAsProvider({
  status,
  category,
  search,
  date,
}: {
  status?: string;
  category?: string;
  search?: string;
  date?: string;
} = {}): Promise<InterventionWithParties[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  let query = supabase
    .from("interventions")
    .select(PARTIES_SELECT)
    .eq("provider_id", user.id)
    .order("scheduled_date", { ascending: true })
    .order("start_time", { ascending: true });

  if (status) query = query.eq("status", status);
  if (category) query = query.eq("category", category);
  if (date) query = query.eq("scheduled_date", date);
  if (search) query = query.ilike("title", `%${search}%`);

  const { data, error } = await query;

  if (error) {
    console.error("getMyInterventionsAsProvider:", error.message);
    return [];
  }

  return data as unknown as InterventionWithParties[];
}

export async function getMyInterventionsAsClient({
  status,
}: { status?: string } = {}): Promise<InterventionWithParties[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  let query = supabase
    .from("interventions")
    .select(PARTIES_SELECT)
    .eq("client_id", user.id)
    .order("scheduled_date", { ascending: false })
    .order("start_time", { ascending: false });

  if (status) query = query.eq("status", status);

  const { data, error } = await query;

  if (error) {
    console.error("getMyInterventionsAsClient:", error.message);
    return [];
  }

  return data as unknown as InterventionWithParties[];
}

export async function getInterventionsAwaitingMyValidation(): Promise<
  InterventionWithParties[]
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data, error } = await supabase
    .from("interventions")
    .select(PARTIES_SELECT)
    .eq("client_id", user.id)
    .eq("status", "completed")
    .order("scheduled_date", { ascending: false });

  if (error) {
    console.error("getInterventionsAwaitingMyValidation:", error.message);
    return [];
  }

  return data as unknown as InterventionWithParties[];
}

export async function getInterventionById(
  id: string,
): Promise<InterventionWithParties | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data, error } = await supabase
    .from("interventions")
    .select(PARTIES_SELECT)
    .eq("id", id)
    .single();

  if (error || !data) {
    if (error) console.error("getInterventionById:", error.message);
    return null;
  }

  const intervention = data as unknown as InterventionWithParties;

  if (intervention.provider_id !== user.id && intervention.client_id !== user.id) {
    return null;
  }

  return intervention;
}

export async function getInterventionStatusHistory(
  interventionId: string,
): Promise<InterventionStatusHistory[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("intervention_status_history")
    .select("*")
    .eq("intervention_id", interventionId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("getInterventionStatusHistory:", error.message);
    return [];
  }

  return data;
}

export async function getInterventionPhotoUrls(
  interventionId: string,
): Promise<{ id: string; type: string; url: string }[]> {
  const supabase = await createClient();
  const { data: photos, error } = await supabase
    .from("intervention_photos")
    .select("*")
    .eq("intervention_id", interventionId)
    .order("created_at", { ascending: true });

  if (error || !photos || photos.length === 0) {
    if (error) console.error("getInterventionPhotoUrls:", error.message);
    return [];
  }

  const results = await Promise.all(
    photos.map(async (photo) => {
      const { data } = await supabase.storage
        .from("intervention-photos")
        .createSignedUrl(photo.path, 3600);
      return { id: photo.id, type: photo.type, url: data?.signedUrl ?? "" };
    }),
  );

  return results.filter((p) => p.url);
}

export type DashboardStats = {
  todayCount: number;
  nextIntervention: InterventionWithParties | null;
  pendingConfirmationCount: number;
  pendingValidationCount: number;
  completedThisMonthCount: number;
  estimatedRevenueThisMonth: number;
};

export async function getProviderDashboardStats(): Promise<DashboardStats> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const empty: DashboardStats = {
    todayCount: 0,
    nextIntervention: null,
    pendingConfirmationCount: 0,
    pendingValidationCount: 0,
    completedThisMonthCount: 0,
    estimatedRevenueThisMonth: 0,
  };

  if (!user) return empty;

  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)
    .toISOString()
    .slice(0, 10);

  const { data: all, error } = await supabase
    .from("interventions")
    .select(PARTIES_SELECT)
    .eq("provider_id", user.id);

  if (error || !all) {
    if (error) console.error("getProviderDashboardStats:", error.message);
    return empty;
  }

  const interventions = all as unknown as InterventionWithParties[];

  const todayCount = interventions.filter(
    (i) => i.scheduled_date === todayStr && i.status !== "cancelled",
  ).length;

  const upcoming = interventions
    .filter(
      (i) =>
        i.scheduled_date >= todayStr &&
        !["cancelled", "validated", "completed"].includes(i.status),
    )
    .sort(
      (a, b) =>
        a.scheduled_date.localeCompare(b.scheduled_date) ||
        a.start_time.localeCompare(b.start_time),
    );

  const pendingConfirmationCount = interventions.filter(
    (i) => i.status === "new_request" || i.status === "pending_confirmation",
  ).length;

  const pendingValidationCount = interventions.filter(
    (i) => i.status === "completed",
  ).length;

  const completedThisMonth = interventions.filter(
    (i) =>
      (i.status === "completed" || i.status === "validated") &&
      i.scheduled_date >= monthStart,
  );

  const estimatedRevenueThisMonth = completedThisMonth.reduce(
    (sum, i) => sum + (i.final_price ?? i.price ?? 0),
    0,
  );

  return {
    todayCount,
    nextIntervention: upcoming[0] ?? null,
    pendingConfirmationCount,
    pendingValidationCount,
    completedThisMonthCount: completedThisMonth.length,
    estimatedRevenueThisMonth,
  };
}
