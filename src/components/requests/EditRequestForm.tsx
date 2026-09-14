"use client";

import { useActionState } from "react";
import { updateRequest } from "@/app/mes-demandes/[id]/actions";
import { INITIAL_ACTION_STATE } from "@/lib/actions/action-state";
import { TextField } from "@/components/ui/TextField";
import { TextAreaField } from "@/components/ui/TextAreaField";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { Alert } from "@/components/ui/Alert";
import { SERVICE_CATEGORIES } from "@/lib/services/categories";
import { REQUEST_STATUSES } from "@/lib/requests/status";
import type { ServiceRequest } from "@/lib/supabase/database.types";

export function EditRequestForm({ request }: { request: ServiceRequest }) {
  const updateRequestWithId = updateRequest.bind(null, request.id);
  const [state, formAction] = useActionState(
    updateRequestWithId,
    INITIAL_ACTION_STATE,
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {state.error ? <Alert>{state.error}</Alert> : null}

      <div className="flex flex-col gap-1.5">
        <label htmlFor="status" className="text-sm font-medium text-brand-ink">
          Statut
        </label>
        <select
          id="status"
          name="status"
          defaultValue={request.status}
          className="rounded-xl border border-brand-ink/15 bg-white px-4 py-3 text-base text-brand-ink focus:border-brand-green focus:outline-none focus:ring-2 focus:ring-brand-green/30"
          required
        >
          {REQUEST_STATUSES.map(({ value, label }) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        {state.fieldErrors?.status?.[0] ? (
          <p className="text-sm text-red-600">{state.fieldErrors.status[0]}</p>
        ) : null}
      </div>

      <TextField
        label="Titre de la demande"
        name="title"
        defaultValue={request.title}
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
          defaultValue={request.category}
          className="rounded-xl border border-brand-ink/15 bg-white px-4 py-3 text-base text-brand-ink focus:border-brand-green focus:outline-none focus:ring-2 focus:ring-brand-green/30"
          required
        >
          {SERVICE_CATEGORIES.map(({ value, label }) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        {state.fieldErrors?.category?.[0] ? (
          <p className="text-sm text-red-600">
            {state.fieldErrors.category[0]}
          </p>
        ) : null}
      </div>

      <TextAreaField
        label="Description"
        name="description"
        defaultValue={request.description}
        error={state.fieldErrors?.description?.[0]}
        required
      />

      <TextField
        label="Budget indicatif (€, facultatif)"
        name="budget"
        type="number"
        min="0"
        step="0.01"
        defaultValue={request.budget ?? ""}
        error={state.fieldErrors?.budget?.[0]}
      />

      <TextField
        label="Ville"
        name="city"
        defaultValue={request.city ?? ""}
        error={state.fieldErrors?.city?.[0]}
      />

      <TextField
        label="Date souhaitée (facultatif)"
        name="desiredDate"
        type="date"
        defaultValue={request.desired_date ?? ""}
        error={state.fieldErrors?.desiredDate?.[0]}
      />

      <SubmitButton pendingLabel="Enregistrement...">
        Enregistrer
      </SubmitButton>
    </form>
  );
}
