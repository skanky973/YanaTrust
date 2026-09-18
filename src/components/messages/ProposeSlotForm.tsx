"use client";

import { useState } from "react";
import { useActionState } from "react";
import { createProposal } from "@/lib/actions/proposals";
import { INITIAL_ACTION_STATE } from "@/lib/actions/action-state";
import { TextField } from "@/components/ui/TextField";
import { TextAreaField } from "@/components/ui/TextAreaField";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { Alert } from "@/components/ui/Alert";
import { SERVICE_CATEGORIES } from "@/lib/services/categories";

export function ProposeSlotForm({
  conversationId,
  requestId,
  applicationId,
  defaultTitle,
  defaultCategory,
}: {
  conversationId: string;
  requestId?: string | null;
  applicationId?: string | null;
  defaultTitle?: string;
  defaultCategory?: string;
}) {
  const [open, setOpen] = useState(false);
  const [state, formAction] = useActionState(createProposal, INITIAL_ACTION_STATE);

  if (state.success) {
    return (
      <div className="mx-4 mb-3">
        <Alert variant="success">
          Proposition envoyée au client, en attente de sa validation.
        </Alert>
      </div>
    );
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mx-4 mb-3 rounded-xl bg-brand-green-dark px-4 py-2.5 text-sm font-semibold text-brand-cream"
      >
        Proposer un créneau
      </button>
    );
  }

  return (
    <form
      action={formAction}
      className="mx-4 mb-3 flex flex-col gap-3 rounded-xl bg-white shadow-sm shadow-black/5 p-4"
    >
      <input type="hidden" name="conversationId" value={conversationId} />
      {requestId ? <input type="hidden" name="requestId" value={requestId} /> : null}
      {applicationId ? <input type="hidden" name="applicationId" value={applicationId} /> : null}

      <h2 className="font-semibold text-brand-ink">Proposer un créneau</h2>

      {state.error ? <Alert>{state.error}</Alert> : null}

      <TextField
        label="Titre de la prestation"
        name="title"
        defaultValue={defaultTitle}
        error={state.fieldErrors?.title?.[0]}
        required
      />

      <div className="flex flex-col gap-1.5">
        <label htmlFor="category" className="text-sm font-medium text-brand-ink">
          Catégorie
        </label>
        <select
          id="category"
          name="category"
          defaultValue={defaultCategory ?? ""}
          className="rounded-xl border border-brand-ink/15 bg-white px-4 py-3 text-base text-brand-ink focus:border-brand-green focus:outline-none focus:ring-2 focus:ring-brand-green/30"
          required
        >
          <option value="" disabled>
            Choisir une catégorie
          </option>
          {SERVICE_CATEGORIES.map(({ value, label }) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        {state.fieldErrors?.category?.[0] ? (
          <p className="text-sm text-red-600">{state.fieldErrors.category[0]}</p>
        ) : null}
      </div>

      <TextAreaField
        label="Description (facultatif)"
        name="description"
        error={state.fieldErrors?.description?.[0]}
      />

      <TextField
        label="Adresse d'intervention (facultatif)"
        name="address"
        error={state.fieldErrors?.address?.[0]}
      />

      <TextField
        label="Téléphone du client (facultatif)"
        name="clientPhone"
        error={state.fieldErrors?.clientPhone?.[0]}
      />

      <div className="grid grid-cols-2 gap-3">
        <TextField
          label="Date"
          name="scheduledDate"
          type="date"
          error={state.fieldErrors?.scheduledDate?.[0]}
          required
        />
        <TextField
          label="Heure"
          name="startTime"
          type="time"
          error={state.fieldErrors?.startTime?.[0]}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <TextField
          label="Durée (minutes)"
          name="durationMinutes"
          type="number"
          min="1"
          step="1"
          error={state.fieldErrors?.durationMinutes?.[0]}
          required
        />
        <TextField
          label="Prix (€, facultatif)"
          name="price"
          type="number"
          min="0"
          step="0.01"
          error={state.fieldErrors?.price?.[0]}
        />
      </div>

      <TextAreaField
        label="Conditions (facultatif)"
        name="conditions"
        error={state.fieldErrors?.conditions?.[0]}
      />

      <div className="flex gap-2">
        <SubmitButton pendingLabel="Envoi...">Envoyer la proposition</SubmitButton>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-xl px-4 py-3 text-sm font-medium text-brand-ink/70"
        >
          Annuler
        </button>
      </div>
    </form>
  );
}
