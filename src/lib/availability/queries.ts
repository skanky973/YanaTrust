import "server-only";
import { createClient } from "@/lib/supabase/server";
import type {
  ProviderWeeklyAvailability,
  ProviderUnavailableDate,
} from "@/lib/supabase/database.types";

export async function getMyWeeklyAvailability(): Promise<
  ProviderWeeklyAvailability[]
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data, error } = await supabase
    .from("provider_weekly_availability")
    .select("*")
    .eq("provider_id", user.id)
    .order("day_of_week", { ascending: true })
    .order("start_time", { ascending: true });

  if (error) {
    console.error("getMyWeeklyAvailability:", error.message);
    return [];
  }

  return data;
}

export async function getMyUnavailableDates(): Promise<
  ProviderUnavailableDate[]
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const todayStr = new Date().toISOString().slice(0, 10);

  const { data, error } = await supabase
    .from("provider_unavailable_dates")
    .select("*")
    .eq("provider_id", user.id)
    .gte("date", todayStr)
    .order("date", { ascending: true });

  if (error) {
    console.error("getMyUnavailableDates:", error.message);
    return [];
  }

  return data;
}
