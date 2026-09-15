"use client";

import { useActionState } from "react";
import { createRequest } from "@/app/publier/demande/actions";
import { INITIAL_ACTION_STATE } from "@/lib/actions/action-state";
import { TextField } from "@/components/ui/TextField";
import { TextAreaField } from "@/components/ui/TextAreaField";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { Alert } from "@/components/ui/Alert";
import { SERVICE_CATEGORIES } from "@/lib/services/categories";

export function RequestForm() {
  const [state, formAction] = useActionState(
    createRequest,
    INITIAL_ACTION_STATE,
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {state.error ? <Alert>{state.error}</Alert> : null}

      <TextField
        label="Titre de la demande"
        name="title"
        placeholder="Ex : Recherche quelqu'un pour tondre mon jardin"
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
          defaultValue=""
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
          <p className="text-sm text-red-600">
            {state.fieldErrors.category[0]}
          </p>
        ) : null}
      </div>

      <TextAreaField
        label="Description"
        name="description"
        placeholder="Décrivez ce dont vous avez besoin..."
        error={state.fieldErrors?.description?.[0]}
        required
      />

      <TextField
        label="Budget indicatif (€, facultatif)"
        name="budget"
        type="number"
        min="0"
        step="0.01"
        error={state.fieldErrors?.budget?.[0]}
      />

      <TextField
        label="Ville"
        name="city"
        defaultValue="Saint-Laurent-du-Maroni"
        error={state.fieldErrors?.city?.[0]}
      />

      <TextField
        label="Date souhaitée (facultatif)"
        name="desiredDate"
        type="date"
        error={state.fieldErrors?.desiredDate?.[0]}
      />

      <div className="flex flex-col gap-1.5">
        <label htmlFor="photos" className="text-sm font-medium text-brand-ink">
          Photos (facultatif, 4 maximum)
        </label>
        <input
          id="photos"
          name="photos"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          className="rounded-xl border border-brand-ink/15 bg-white px-4 py-3 text-sm text-brand-ink file:mr-3 file:rounded-lg file:border-0 file:bg-brand-green-dark file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-brand-cream"
        />
      </div>

      <SubmitButton pendingLabel="Publication...">
        Publier la demande
      </SubmitButton>
    </form>
  );
}
