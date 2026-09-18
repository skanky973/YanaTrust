"use client";

import { useState } from "react";
import { useActionState } from "react";
import Link from "next/link";
import {
  clientAcceptProposal,
  clientRefuseProposal,
  clientRequestModification,
  providerConfirmProposal,
  resubmitProposal,
  cancelProposal,
} from "@/lib/actions/proposals";
import { INITIAL_ACTION_STATE } from "@/lib/actions/action-state";
import { getProposalStatusLabel, getProposalStatusColor } from "@/lib/proposals/status";
import { getCategoryLabel, SERVICE_CATEGORIES } from "@/lib/services/categories";
import { Alert } from "@/components/ui/Alert";
import { TextField } from "@/components/ui/TextField";
import { TextAreaField } from "@/components/ui/TextAreaField";
import { SubmitButton } from "@/components/ui/SubmitButton";
import type { ProposalWithParties } from "@/lib/proposals/queries";

export function ProposalCard({
  proposal,
  currentUserId,
}: {
  proposal: ProposalWithParties;
  currentUserId: string;
}) {
  const isClient = proposal.client_id === currentUserId;
  const isProvider = proposal.provider_id === currentUserId;
  const [showModificationForm, setShowModificationForm] = useState(false);

  const [confirmState, confirmAction] = useActionState(
    providerConfirmProposal.bind(null, proposal.id),
    INITIAL_ACTION_STATE,
  );
  const [modificationState, modificationAction] = useActionState(
    clientRequestModification.bind(null, proposal.id),
    INITIAL_ACTION_STATE,
  );
  const [resubmitState, resubmitAction] = useActionState(
    resubmitProposal.bind(null, proposal.id),
    INITIAL_ACTION_STATE,
  );
  const [showResubmitForm, setShowResubmitForm] = useState(false);

  const canCancel = ["pending_client", "pending_provider", "modification_requested"].includes(
    proposal.status,
  );

  return (
    <div className="mx-4 mb-3 flex flex-col gap-2 rounded-xl bg-white shadow-sm shadow-black/5 p-4">
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-semibold text-brand-ink">{proposal.title}</h3>
        <span
          className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${getProposalStatusColor(proposal.status)}`}
        >
          {getProposalStatusLabel(proposal.status)}
        </span>
      </div>

      <p className="text-xs text-brand-ink/70">{getCategoryLabel(proposal.category)}</p>

      <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-sm text-brand-ink/80">
        <span>
          {new Date(proposal.scheduled_date).toLocaleDateString("fr-FR")} à{" "}
          {proposal.start_time.slice(0, 5)}
        </span>
        <span>{proposal.duration_minutes} min</span>
        {proposal.price !== null ? <span>{proposal.price} €</span> : null}
        {proposal.address ? <span className="col-span-2">{proposal.address}</span> : null}
      </div>

      {proposal.description ? (
        <p className="text-sm text-brand-ink/70">{proposal.description}</p>
      ) : null}
      {proposal.conditions ? (
        <p className="text-xs text-brand-ink/65">Conditions : {proposal.conditions}</p>
      ) : null}

      {confirmState.error ? <Alert>{confirmState.error}</Alert> : null}
      {modificationState.error ? <Alert>{modificationState.error}</Alert> : null}

      {proposal.status === "confirmed" ? (
        <p className="text-sm font-medium text-brand-green-dark">
          Prestation confirmée
          {proposal.intervention_id ? (
            <>
              {" — "}
              <Link href={`/planning/${proposal.intervention_id}`} className="underline">
                voir dans le planning
              </Link>
            </>
          ) : null}
        </p>
      ) : null}

      {isClient && proposal.status === "pending_client" ? (
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap gap-2">
            <form action={clientAcceptProposal.bind(null, proposal.id)}>
              <button
                type="submit"
                className="rounded-lg bg-brand-green-dark px-3 py-1.5 text-sm font-medium text-brand-cream"
              >
                Accepter ce créneau
              </button>
            </form>
            <form action={clientRefuseProposal.bind(null, proposal.id)}>
              <button
                type="submit"
                className="rounded-lg bg-red-50 px-3 py-1.5 text-sm font-medium text-red-600"
              >
                Refuser
              </button>
            </form>
            <button
              type="button"
              onClick={() => setShowModificationForm((v) => !v)}
              className="rounded-lg bg-brand-ink/5 px-3 py-1.5 text-sm font-medium text-brand-ink/70"
            >
              Demander une modification
            </button>
          </div>

          {showModificationForm ? (
            <form action={modificationAction} className="flex flex-col gap-2">
              <textarea
                name="comment"
                placeholder="Précisez ce que vous souhaitez modifier..."
                className="min-h-20 rounded-xl border border-brand-ink/15 bg-white px-3 py-2 text-sm text-brand-ink placeholder:text-brand-ink/65 focus:border-brand-green focus:outline-none focus:ring-2 focus:ring-brand-green/30"
              />
              <SubmitButton pendingLabel="Envoi..." className="self-start px-3 py-1.5 text-sm">
                Envoyer la demande
              </SubmitButton>
            </form>
          ) : null}
        </div>
      ) : null}

      {isProvider && proposal.status === "pending_provider" ? (
        <div className="flex flex-col gap-2">
          <p className="text-xs text-brand-ink/70">
            Le client a accepté ce créneau. Confirmez pour l&rsquo;ajouter définitivement à
            votre planning.
          </p>
          <form action={confirmAction}>
            <SubmitButton pendingLabel="Validation...">Valider définitivement</SubmitButton>
          </form>
        </div>
      ) : null}

      {isProvider && proposal.status === "modification_requested" ? (
        <div className="flex flex-col gap-2">
          <p className="text-xs text-brand-ink/70">
            Le client a demandé une modification. Ajustez votre proposition et renvoyez-la.
          </p>
          {resubmitState.error ? <Alert>{resubmitState.error}</Alert> : null}
          {resubmitState.success ? (
            <Alert variant="success">Nouvelle proposition envoyée au client.</Alert>
          ) : !showResubmitForm ? (
            <button
              type="button"
              onClick={() => setShowResubmitForm(true)}
              className="self-start rounded-lg bg-brand-green-dark px-3 py-1.5 text-sm font-medium text-brand-cream"
            >
              Modifier et renvoyer
            </button>
          ) : (
            <form action={resubmitAction} className="flex flex-col gap-3">
              <TextField
                label="Titre"
                name="title"
                defaultValue={proposal.title}
                error={resubmitState.fieldErrors?.title?.[0]}
                required
              />
              <div className="flex flex-col gap-1.5">
                <label htmlFor={`category-${proposal.id}`} className="text-sm font-medium text-brand-ink">
                  Catégorie
                </label>
                <select
                  id={`category-${proposal.id}`}
                  name="category"
                  defaultValue={proposal.category}
                  className="rounded-xl border border-brand-ink/15 bg-white px-4 py-3 text-base text-brand-ink focus:border-brand-green focus:outline-none focus:ring-2 focus:ring-brand-green/30"
                  required
                >
                  {SERVICE_CATEGORIES.map(({ value, label }) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
              <TextAreaField
                label="Description"
                name="description"
                defaultValue={proposal.description ?? undefined}
                error={resubmitState.fieldErrors?.description?.[0]}
              />
              <TextField
                label="Adresse"
                name="address"
                defaultValue={proposal.address ?? undefined}
                error={resubmitState.fieldErrors?.address?.[0]}
              />
              <TextField
                label="Téléphone du client"
                name="clientPhone"
                defaultValue={proposal.client_phone ?? undefined}
                error={resubmitState.fieldErrors?.clientPhone?.[0]}
              />
              <div className="grid grid-cols-2 gap-3">
                <TextField
                  label="Date"
                  name="scheduledDate"
                  type="date"
                  defaultValue={proposal.scheduled_date}
                  error={resubmitState.fieldErrors?.scheduledDate?.[0]}
                  required
                />
                <TextField
                  label="Heure"
                  name="startTime"
                  type="time"
                  defaultValue={proposal.start_time.slice(0, 5)}
                  error={resubmitState.fieldErrors?.startTime?.[0]}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <TextField
                  label="Durée (minutes)"
                  name="durationMinutes"
                  type="number"
                  min="1"
                  defaultValue={proposal.duration_minutes}
                  error={resubmitState.fieldErrors?.durationMinutes?.[0]}
                  required
                />
                <TextField
                  label="Prix (€)"
                  name="price"
                  type="number"
                  min="0"
                  step="0.01"
                  defaultValue={proposal.price ?? undefined}
                  error={resubmitState.fieldErrors?.price?.[0]}
                />
              </div>
              <TextAreaField
                label="Conditions"
                name="conditions"
                defaultValue={proposal.conditions ?? undefined}
                error={resubmitState.fieldErrors?.conditions?.[0]}
              />
              <SubmitButton pendingLabel="Envoi..." className="self-start px-3 py-1.5 text-sm">
                Renvoyer la proposition
              </SubmitButton>
            </form>
          )}
        </div>
      ) : null}

      {canCancel ? (
        <form action={cancelProposal.bind(null, proposal.id)}>
          <button type="submit" className="text-xs font-medium text-brand-ink/65 underline">
            Annuler cette proposition
          </button>
        </form>
      ) : null}
    </div>
  );
}
