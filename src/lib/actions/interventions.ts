"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import {
  interventionFormSchema,
  completionReportSchema,
  clientValidationSchema,
} from "@/lib/validation/intervention";
import { hasScheduleConflict } from "@/lib/interventions/conflicts";
import { uploadInterventionPhotos } from "@/lib/interventions/photo-upload";
import { createNotification } from "@/lib/notifications/create";
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

// ----------------------------------------------------------------------------
// Création manuelle par le prestataire
// ----------------------------------------------------------------------------
export async function createIntervention(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = interventionFormSchema.safeParse({
    clientId: formData.get("clientId"),
    title: formData.get("title"),
    category: formData.get("category"),
    description: formData.get("description"),
    address: formData.get("address"),
    clientPhone: formData.get("clientPhone"),
    scheduledDate: formData.get("scheduledDate"),
    startTime: formData.get("startTime"),
    durationMinutes: formData.get("durationMinutes"),
    price: formData.get("price"),
  });

  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }

  const { supabase, userId } = await requireCurrentUser();
  const {
    clientId,
    title,
    category,
    description,
    address,
    clientPhone,
    scheduledDate,
    startTime,
    durationMinutes,
    price,
  } = parsed.data;

  const ignoreConflict = formData.get("ignoreConflict") === "true";

  if (!ignoreConflict) {
    const conflict = await hasScheduleConflict({
      providerId: userId,
      date: scheduledDate,
      startTime,
      durationMinutes,
    });

    if (conflict) {
      return { error: "CONFLICT" };
    }
  }

  const { data: created, error } = await supabase
    .from("interventions")
    .insert({
      provider_id: userId,
      client_id: clientId,
      title,
      category,
      description: description || "",
      address: address || null,
      client_phone: clientPhone || null,
      scheduled_date: scheduledDate,
      start_time: startTime,
      duration_minutes: durationMinutes,
      price: price ? Number(price) : null,
      status: "confirmed",
    })
    .select("id")
    .single();

  if (error || !created) {
    return { error: "Impossible de créer l'intervention." };
  }

  await createNotification(supabase, {
    userId: clientId,
    type: "appointment_changed",
    title: "Nouvelle intervention planifiée",
    body: `${title} le ${scheduledDate} à ${startTime}.`,
    interventionId: created.id,
  });

  redirect(`/planning/${created.id}`);
}

// ----------------------------------------------------------------------------
// Reprogrammation (date / heure)
// ----------------------------------------------------------------------------
export async function rescheduleIntervention(
  interventionId: string,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const scheduledDate = formData.get("scheduledDate")?.toString() ?? "";
  const startTime = formData.get("startTime")?.toString() ?? "";
  const durationMinutes = Number(formData.get("durationMinutes"));
  const ignoreConflict = formData.get("ignoreConflict") === "true";

  if (!scheduledDate || !startTime || !durationMinutes) {
    return { error: "Date, heure et durée requises." };
  }

  const { supabase, userId } = await requireCurrentUser();

  if (!ignoreConflict) {
    const conflict = await hasScheduleConflict({
      providerId: userId,
      date: scheduledDate,
      startTime,
      durationMinutes,
      excludeInterventionId: interventionId,
    });

    if (conflict) {
      return { error: "CONFLICT" };
    }
  }

  const { data: intervention } = await supabase
    .from("interventions")
    .select("client_id, title")
    .eq("id", interventionId)
    .single();

  const { error } = await supabase
    .from("interventions")
    .update({
      scheduled_date: scheduledDate,
      start_time: startTime,
      duration_minutes: durationMinutes,
      status: "scheduled",
    })
    .eq("id", interventionId)
    .eq("provider_id", userId);

  if (error) {
    return { error: "Impossible de reprogrammer l'intervention." };
  }

  if (intervention) {
    await createNotification(supabase, {
      userId: intervention.client_id,
      type: "appointment_changed",
      title: "Rendez-vous reprogrammé",
      body: `${intervention.title} est maintenant prévu le ${scheduledDate} à ${startTime}.`,
      interventionId,
    });
  }

  revalidatePath(`/planning/${interventionId}`);
  return { success: true };
}

// ----------------------------------------------------------------------------
// Transitions de statut rapides (boutons)
// ----------------------------------------------------------------------------
async function transitionStatus(
  interventionId: string,
  newStatus: string,
  notifyTitle: string,
) {
  const { supabase, userId } = await requireCurrentUser();

  const { data: intervention } = await supabase
    .from("interventions")
    .select("client_id, provider_id, title")
    .eq("id", interventionId)
    .single();

  if (!intervention) return;

  const isProvider = intervention.provider_id === userId;
  const otherPartyId = isProvider ? intervention.client_id : intervention.provider_id;

  await supabase
    .from("interventions")
    .update({ status: newStatus })
    .eq("id", interventionId);

  await createNotification(supabase, {
    userId: otherPartyId,
    type:
      newStatus === "cancelled"
        ? "cancelled"
        : newStatus === "confirmed"
          ? "request_accepted"
          : newStatus === "completed"
            ? "validation_requested"
            : "appointment_changed",
    title: notifyTitle,
    body: intervention.title,
    interventionId,
  });

  revalidatePath(`/planning/${interventionId}`);
  revalidatePath("/planning");
}

export async function acceptIntervention(interventionId: string) {
  await transitionStatus(interventionId, "confirmed", "Demande acceptée");
}

export async function refuseIntervention(interventionId: string) {
  await transitionStatus(interventionId, "cancelled", "Demande refusée");
}

export async function markOnTheWay(interventionId: string) {
  await transitionStatus(interventionId, "on_the_way", "Le prestataire est en route");
}

export async function startIntervention(interventionId: string) {
  await transitionStatus(interventionId, "in_progress", "Intervention commencée");
}

export async function cancelIntervention(interventionId: string) {
  await transitionStatus(interventionId, "cancelled", "Intervention annulée");
}

// ----------------------------------------------------------------------------
// Terminer l'intervention : compte-rendu + photos + demande de validation
// ----------------------------------------------------------------------------
export async function submitCompletionReport(
  interventionId: string,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = completionReportSchema.safeParse({
    workNotes: formData.get("workNotes"),
    materialsUsed: formData.get("materialsUsed"),
    finalPrice: formData.get("finalPrice"),
    needsFollowup: formData.get("needsFollowup") === "on",
  });

  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }

  const { supabase, userId } = await requireCurrentUser();
  const { workNotes, materialsUsed, finalPrice, needsFollowup } = parsed.data;

  const { data: intervention } = await supabase
    .from("interventions")
    .select("client_id, title")
    .eq("id", interventionId)
    .eq("provider_id", userId)
    .single();

  if (!intervention) {
    return { error: "Intervention introuvable." };
  }

  const { error } = await supabase
    .from("interventions")
    .update({
      work_notes: workNotes,
      materials_used: materialsUsed || null,
      final_price: finalPrice ? Number(finalPrice) : null,
      needs_followup: needsFollowup,
      status: "completed",
    })
    .eq("id", interventionId)
    .eq("provider_id", userId);

  if (error) {
    return { error: "Impossible d'enregistrer le compte-rendu." };
  }

  const beforePhotos = formData
    .getAll("beforePhotos")
    .filter((f): f is File => f instanceof File);
  const afterPhotos = formData
    .getAll("afterPhotos")
    .filter((f): f is File => f instanceof File);

  if (beforePhotos.length > 0) {
    await uploadInterventionPhotos(supabase, {
      interventionId,
      type: "before",
      files: beforePhotos,
    });
  }
  if (afterPhotos.length > 0) {
    await uploadInterventionPhotos(supabase, {
      interventionId,
      type: "after",
      files: afterPhotos,
    });
  }

  await createNotification(supabase, {
    userId: intervention.client_id,
    type: "validation_requested",
    title: "Intervention terminée — validation demandée",
    body: `${intervention.title} : merci de confirmer que tout s'est bien passé.`,
    interventionId,
  });

  redirect(`/planning/${interventionId}`);
}

// ----------------------------------------------------------------------------
// Validation côté client
// ----------------------------------------------------------------------------
export async function submitClientValidation(
  interventionId: string,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = clientValidationSchema.safeParse({
    decision: formData.get("decision"),
    comment: formData.get("comment"),
    rating: formData.get("rating"),
  });

  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }

  const { supabase, userId } = await requireCurrentUser();
  const { decision, comment, rating } = parsed.data;

  const { data: intervention } = await supabase
    .from("interventions")
    .select("provider_id, title")
    .eq("id", interventionId)
    .eq("client_id", userId)
    .single();

  if (!intervention) {
    return { error: "Intervention introuvable." };
  }

  const update =
    decision === "confirm"
      ? {
          status: "validated",
          client_validated_at: new Date().toISOString(),
          client_comment: comment || null,
          client_rating: rating,
        }
      : {
          client_reported_problem: true,
          client_comment: comment || null,
        };

  const { error } = await supabase
    .from("interventions")
    .update(update)
    .eq("id", interventionId)
    .eq("client_id", userId);

  if (error) {
    return { error: "Impossible d'enregistrer votre réponse." };
  }

  await createNotification(supabase, {
    userId: intervention.provider_id,
    type: decision === "confirm" ? "client_validated" : "client_problem",
    title:
      decision === "confirm"
        ? "Intervention validée par le client"
        : "Le client a signalé un problème",
    body: intervention.title,
    interventionId,
  });

  revalidatePath(`/planning/${interventionId}`);
  return { success: true };
}
