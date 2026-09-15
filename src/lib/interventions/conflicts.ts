import "server-only";
import { createClient } from "@/lib/supabase/server";

export async function hasScheduleConflict({
  providerId,
  date,
  startTime,
  durationMinutes,
  excludeInterventionId,
}: {
  providerId: string;
  date: string;
  startTime: string;
  durationMinutes: number;
  excludeInterventionId?: string;
}): Promise<boolean> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("interventions")
    .select("id, start_time, duration_minutes")
    .eq("provider_id", providerId)
    .eq("scheduled_date", date)
    .neq("status", "cancelled");

  if (error || !data) return false;

  const [newStartH, newStartM] = startTime.split(":").map(Number);
  const newStart = newStartH * 60 + newStartM;
  const newEnd = newStart + durationMinutes;

  return data.some((existing) => {
    if (excludeInterventionId && existing.id === excludeInterventionId) return false;
    const [h, m] = existing.start_time.split(":").map(Number);
    const existingStart = h * 60 + m;
    const existingEnd = existingStart + existing.duration_minutes;
    return newStart < existingEnd && existingStart < newEnd;
  });
}
