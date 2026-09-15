"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { applicationFormSchema } from "@/lib/validation/application";
import { getOrCreateConversation } from "@/lib/conversations/get-or-create";
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

export async function submitApplication(
  requestId: string,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = applicationFormSchema.safeParse({
    message: formData.get("message"),
    proposedPrice: formData.get("proposedPrice"),
    estimatedDurationMinutes: formData.get("estimatedDurationMinutes"),
    note: formData.get("note"),
  });

  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }

  const { supabase, userId } = await requireCurrentUser();
  const { message, proposedPrice, estimatedDurationMinutes, note } = parsed.data;

  const { data: request } = await supabase
    .from("requests")
    .select("client_id, title")
    .eq("id", requestId)
    .single();

  if (!request) {
    return { error: "Demande introuvable." };
  }

  const { error } = await supabase.from("request_applications").insert({
    request_id: requestId,
    provider_id: userId,
    message,
    proposed_price: proposedPrice ? Number(proposedPrice) : null,
    estimated_duration_minutes: estimatedDurationMinutes
      ? Number(estimatedDurationMinutes)
      : null,
    note: note || null,
  });

  if (error) {
    if (error.code === "23505") {
      return { error: "Vous avez déjà postulé à cette demande." };
    }
    return { error: "Impossible d'envoyer votre candidature." };
  }

  await createNotification(supabase, {
    userId: request.client_id,
    type: "new_application",
    title: "Nouvelle candidature reçue",
    body: request.title,
  });

  revalidatePath(`/demandes/${requestId}`);
  return { success: true };
}

export async function updateMyApplication(
  applicationId: string,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = applicationFormSchema.safeParse({
    message: formData.get("message"),
    proposedPrice: formData.get("proposedPrice"),
    estimatedDurationMinutes: formData.get("estimatedDurationMinutes"),
    note: formData.get("note"),
  });

  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }

  const { supabase, userId } = await requireCurrentUser();
  const { message, proposedPrice, estimatedDurationMinutes, note } = parsed.data;

  const { error } = await supabase
    .from("request_applications")
    .update({
      message,
      proposed_price: proposedPrice ? Number(proposedPrice) : null,
      estimated_duration_minutes: estimatedDurationMinutes
        ? Number(estimatedDurationMinutes)
        : null,
      note: note || null,
    })
    .eq("id", applicationId)
    .eq("provider_id", userId);

  if (error) {
    return { error: "Impossible de modifier votre proposition (elle n'est peut-être plus en attente)." };
  }

  return { success: true };
}

export async function acceptApplication(applicationId: string) {
  const { supabase, userId } = await requireCurrentUser();

  const { data: application } = (await supabase
    .from("request_applications")
    .select("id, provider_id, request_id, requests:requests(client_id, title)")
    .eq("id", applicationId)
    .single()) as unknown as {
    data: {
      id: string;
      provider_id: string;
      request_id: string;
      requests: { client_id: string; title: string } | null;
    } | null;
  };

  if (!application) return;

  const conversationId = await getOrCreateConversation(
    supabase,
    userId,
    application.provider_id,
  );

  await supabase
    .from("request_applications")
    .update({ status: "accepted_for_discussion", conversation_id: conversationId })
    .eq("id", applicationId);

  await supabase
    .from("requests")
    .update({ status: "in_discussion" })
    .eq("id", application.request_id)
    .eq("status", "open");

  const requestTitle =
    (application.requests as unknown as { title: string } | null)?.title ?? "";

  await createNotification(supabase, {
    userId: application.provider_id,
    type: "application_accepted",
    title: "Votre candidature a été acceptée",
    body: requestTitle,
  });

  revalidatePath(`/demandes/${application.request_id}`);
  revalidatePath(`/mes-demandes/${application.request_id}`);

  if (conversationId) {
    redirect(`/messages/${conversationId}`);
  }
}

export async function refuseApplication(applicationId: string) {
  const { supabase } = await requireCurrentUser();

  const { data: application } = (await supabase
    .from("request_applications")
    .select("id, provider_id, request_id, requests:requests(title)")
    .eq("id", applicationId)
    .single()) as unknown as {
    data: {
      id: string;
      provider_id: string;
      request_id: string;
      requests: { title: string } | null;
    } | null;
  };

  if (!application) return;

  await supabase
    .from("request_applications")
    .update({ status: "refused" })
    .eq("id", applicationId);

  const requestTitle =
    (application.requests as unknown as { title: string } | null)?.title ?? "";

  await createNotification(supabase, {
    userId: application.provider_id,
    type: "application_refused",
    title: "Votre candidature a été refusée",
    body: requestTitle,
  });

  revalidatePath(`/demandes/${application.request_id}`);
}
