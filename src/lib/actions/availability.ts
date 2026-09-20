"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { heureSchema } from "@/lib/validation/time";
import type { ActionState } from "@/lib/actions/action-state";

async function requireCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Non authentifié.");
  }

  return { supabase, userId: user.id };
}

const weeklySlotSchema = z.object({
  dayOfWeek: z
    .string()
    .transform((v) => Number(v))
    .refine((v) => Number.isInteger(v) && v >= 0 && v <= 6, "Jour invalide."),
  startTime: heureSchema,
  endTime: heureSchema,
});

export async function addWeeklySlot(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = weeklySlotSchema.safeParse({
    dayOfWeek: formData.get("dayOfWeek"),
    startTime: formData.get("startTime"),
    endTime: formData.get("endTime"),
  });

  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }

  if (parsed.data.endTime <= parsed.data.startTime) {
    return { error: "L'heure de fin doit être après l'heure de début." };
  }

  const { supabase, userId } = await requireCurrentUser();

  const { error } = await supabase.from("provider_weekly_availability").insert({
    provider_id: userId,
    day_of_week: parsed.data.dayOfWeek,
    start_time: parsed.data.startTime,
    end_time: parsed.data.endTime,
  });

  if (error) {
    return { error: "Impossible d'ajouter ce créneau." };
  }

  revalidatePath("/planning/disponibilites");
  return { success: true };
}

export async function deleteWeeklySlot(slotId: string) {
  const { supabase, userId } = await requireCurrentUser();

  await supabase
    .from("provider_weekly_availability")
    .delete()
    .eq("id", slotId)
    .eq("provider_id", userId);

  revalidatePath("/planning/disponibilites");
}

const unavailableDateSchema = z.object({
  date: z.string().min(1, "Date requise."),
  reason: z.string().trim().max(200).optional().or(z.literal("")),
});

export async function addUnavailableDate(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = unavailableDateSchema.safeParse({
    date: formData.get("date"),
    reason: formData.get("reason"),
  });

  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }

  const { supabase, userId } = await requireCurrentUser();

  const { error } = await supabase.from("provider_unavailable_dates").insert({
    provider_id: userId,
    date: parsed.data.date,
    reason: parsed.data.reason || null,
  });

  if (error) {
    return { error: "Cette date est déjà marquée indisponible, ou une erreur est survenue." };
  }

  revalidatePath("/planning/disponibilites");
  return { success: true };
}

export async function deleteUnavailableDate(dateId: string) {
  const { supabase, userId } = await requireCurrentUser();

  await supabase
    .from("provider_unavailable_dates")
    .delete()
    .eq("id", dateId)
    .eq("provider_id", userId);

  revalidatePath("/planning/disponibilites");
}
