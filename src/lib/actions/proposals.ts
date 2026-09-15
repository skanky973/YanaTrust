"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { proposalFormSchema } from "@/lib/validation/proposal";
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

// ----------------------------------------------------------------------------
// Création d'une proposition par le prestataire.
// Deux points d'entrée possibles :
//   - depuis /planning/nouveau : formData.clientId identifie le client, une
//     conversation est retrouvée ou créée.
//   - depuis une conversation existante : formData.conversationId est déjà
//     connu (et éventuellement applicationId/requestId).
// ----------------------------------------------------------------------------
export async function createProposal(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = proposalFormSchema.safeParse({
    title: formData.get("title"),
    category: formData.get("category"),
    description: formData.get("description"),
    address: formData.get("address"),
    clientPhone: formData.get("clientPhone"),
    conditions: formData.get("conditions"),
    scheduledDate: formData.get("scheduledDate"),
    startTime: formData.get("startTime"),
    durationMinutes: formData.get("durationMinutes"),
    price: formData.get("price"),
  });

  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }

  const { supabase, userId } = await requireCurrentUser();

  const { data: actingProfile } = await supabase
    .from("profiles")
    .select("is_provider")
    .eq("id", userId)
    .single();

  if (!actingProfile?.is_provider) {
    return { error: "Seul un compte prestataire peut proposer une prestation." };
  }

  const conversationIdInput = formData.get("conversationId")?.toString();
  const clientIdInput = formData.get("clientId")?.toString();
  const requestId = formData.get("requestId")?.toString() || null;
  const applicationId = formData.get("applicationId")?.toString() || null;

  let conversationId: string | null = conversationIdInput || null;
  let clientId = clientIdInput || null;

  if (conversationId) {
    const { data: conversation } = await supabase
      .from("conversations")
      .select("participant_one, participant_two")
      .eq("id", conversationId)
      .single();

    if (!conversation) {
      return { error: "Conversation introuvable." };
    }

    clientId =
      conversation.participant_one === userId
        ? conversation.participant_two
        : conversation.participant_one;
  } else if (clientId) {
    conversationId = await getOrCreateConversation(supabase, userId, clientId);
  } else {
    return { error: "Client manquant." };
  }

  if (!clientId) {
    return { error: "Impossible d'identifier le client." };
  }

  const {
    title,
    category,
    description,
    address,
    clientPhone,
    conditions,
    scheduledDate,
    startTime,
    durationMinutes,
    price,
  } = parsed.data;

  const { data: created, error } = await supabase
    .from("booking_proposals")
    .insert({
      request_id: requestId,
      application_id: applicationId,
      conversation_id: conversationId,
      provider_id: userId,
      client_id: clientId,
      title,
      category,
      description: description || "",
      address: address || null,
      client_phone: clientPhone || null,
      conditions: conditions || null,
      scheduled_date: scheduledDate,
      start_time: startTime,
      duration_minutes: durationMinutes,
      price: price ? Number(price) : null,
    })
    .select("id")
    .single();

  if (error || !created) {
    return { error: "Impossible de créer la proposition." };
  }

  await createNotification(supabase, {
    userId: clientId,
    type: requestId ? "new_slot_proposal" : "provider_proposal",
    title: requestId ? "Nouveau créneau proposé" : "Nouvelle proposition de prestation",
    body: title,
  });

  revalidatePath(conversationId ? `/messages/${conversationId}` : "/messages");
  return { success: true, redirectTo: conversationId ? `/messages/${conversationId}` : undefined };
}

// ----------------------------------------------------------------------------
// Réponses du client à une proposition
// ----------------------------------------------------------------------------
export async function clientAcceptProposal(proposalId: string) {
  const { supabase, userId } = await requireCurrentUser();

  const { data: proposal } = await supabase
    .from("booking_proposals")
    .select("provider_id, title, conversation_id")
    .eq("id", proposalId)
    .eq("client_id", userId)
    .single();

  if (!proposal) return;

  await supabase
    .from("booking_proposals")
    .update({
      status: "pending_provider",
      client_validated_at: new Date().toISOString(),
      client_validated_by: userId,
    })
    .eq("id", proposalId);

  await createNotification(supabase, {
    userId: proposal.provider_id,
    type: "slot_accepted",
    title: "Créneau accepté par le client",
    body: proposal.title,
  });

  if (proposal.conversation_id) {
    revalidatePath(`/messages/${proposal.conversation_id}`);
  }
}

export async function clientRefuseProposal(proposalId: string) {
  const { supabase, userId } = await requireCurrentUser();

  const { data: proposal } = await supabase
    .from("booking_proposals")
    .select("provider_id, title, conversation_id")
    .eq("id", proposalId)
    .eq("client_id", userId)
    .single();

  if (!proposal) return;

  await supabase
    .from("booking_proposals")
    .update({ status: "refused" })
    .eq("id", proposalId);

  await createNotification(supabase, {
    userId: proposal.provider_id,
    type: "slot_refused",
    title: "Créneau refusé par le client",
    body: proposal.title,
  });

  if (proposal.conversation_id) {
    revalidatePath(`/messages/${proposal.conversation_id}`);
  }
}

export async function clientRequestModification(
  proposalId: string,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { supabase, userId } = await requireCurrentUser();
  const comment = formData.get("comment")?.toString().trim() || "";

  const { data: proposal } = await supabase
    .from("booking_proposals")
    .select("provider_id, title, conversation_id")
    .eq("id", proposalId)
    .eq("client_id", userId)
    .single();

  if (!proposal) {
    return { error: "Proposition introuvable." };
  }

  const { error } = await supabase
    .from("booking_proposals")
    .update({ status: "modification_requested" })
    .eq("id", proposalId);

  if (error) {
    return { error: "Impossible d'envoyer la demande de modification." };
  }

  if (proposal.conversation_id && comment) {
    await supabase.from("messages").insert({
      conversation_id: proposal.conversation_id,
      sender_id: userId,
      content: `Modification demandée : ${comment}`,
    });
  }

  await createNotification(supabase, {
    userId: proposal.provider_id,
    type: "modification_requested",
    title: "Modification demandée",
    body: proposal.title,
  });

  if (proposal.conversation_id) {
    revalidatePath(`/messages/${proposal.conversation_id}`);
  }

  return { success: true };
}

// ----------------------------------------------------------------------------
// Validation finale du prestataire : déclenche la cascade côté base
// (création de l'intervention, annulation des propositions concurrentes,
// etc. — voir handle_booking_proposal_confirmed dans schema.sql).
// ----------------------------------------------------------------------------
export async function providerConfirmProposal(
  proposalId: string,
  _prevState: ActionState,
  _formData: FormData,
): Promise<ActionState> {
  const { supabase, userId } = await requireCurrentUser();

  const { data: proposal } = await supabase
    .from("booking_proposals")
    .select("client_id, title, conversation_id")
    .eq("id", proposalId)
    .eq("provider_id", userId)
    .single();

  if (!proposal) {
    return { error: "Proposition introuvable." };
  }

  const { error } = await supabase
    .from("booking_proposals")
    .update({
      status: "confirmed",
      provider_validated_at: new Date().toISOString(),
      provider_validated_by: userId,
    })
    .eq("id", proposalId);

  if (error) {
    return {
      error: error.message.includes("disponible")
        ? "Ce créneau n'est plus disponible. Vérifiez votre planning."
        : "Impossible de confirmer la prestation.",
    };
  }

  if (proposal.conversation_id) {
    revalidatePath(`/messages/${proposal.conversation_id}`);
  }
  revalidatePath("/planning");

  return { success: true };
}

// ----------------------------------------------------------------------------
// Le prestataire modifie sa proposition suite à une demande du client, puis
// la renvoie (modification_requested -> pending_client).
// ----------------------------------------------------------------------------
export async function resubmitProposal(
  proposalId: string,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = proposalFormSchema.safeParse({
    title: formData.get("title"),
    category: formData.get("category"),
    description: formData.get("description"),
    address: formData.get("address"),
    clientPhone: formData.get("clientPhone"),
    conditions: formData.get("conditions"),
    scheduledDate: formData.get("scheduledDate"),
    startTime: formData.get("startTime"),
    durationMinutes: formData.get("durationMinutes"),
    price: formData.get("price"),
  });

  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }

  const { supabase, userId } = await requireCurrentUser();

  const { data: proposal } = await supabase
    .from("booking_proposals")
    .select("client_id, conversation_id")
    .eq("id", proposalId)
    .eq("provider_id", userId)
    .single();

  if (!proposal) {
    return { error: "Proposition introuvable." };
  }

  const {
    title,
    category,
    description,
    address,
    clientPhone,
    conditions,
    scheduledDate,
    startTime,
    durationMinutes,
    price,
  } = parsed.data;

  const { error } = await supabase
    .from("booking_proposals")
    .update({
      title,
      category,
      description: description || "",
      address: address || null,
      client_phone: clientPhone || null,
      conditions: conditions || null,
      scheduled_date: scheduledDate,
      start_time: startTime,
      duration_minutes: durationMinutes,
      price: price ? Number(price) : null,
      status: "pending_client",
    })
    .eq("id", proposalId);

  if (error) {
    return { error: "Impossible d'envoyer la nouvelle proposition." };
  }

  await createNotification(supabase, {
    userId: proposal.client_id,
    type: "new_slot_proposal",
    title: "Proposition mise à jour",
    body: title,
  });

  if (proposal.conversation_id) {
    revalidatePath(`/messages/${proposal.conversation_id}`);
  }

  return { success: true };
}

export async function cancelProposal(proposalId: string) {
  const { supabase, userId } = await requireCurrentUser();

  const { data: proposal } = await supabase
    .from("booking_proposals")
    .select("provider_id, client_id, title, conversation_id")
    .eq("id", proposalId)
    .or(`provider_id.eq.${userId},client_id.eq.${userId}`)
    .single();

  if (!proposal) return;

  await supabase
    .from("booking_proposals")
    .update({ status: "cancelled" })
    .eq("id", proposalId);

  const otherPartyId = proposal.provider_id === userId ? proposal.client_id : proposal.provider_id;

  await createNotification(supabase, {
    userId: otherPartyId,
    type: "booking_cancelled",
    title: "Proposition annulée",
    body: proposal.title,
  });

  if (proposal.conversation_id) {
    revalidatePath(`/messages/${proposal.conversation_id}`);
  }
}
