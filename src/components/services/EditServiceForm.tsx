"use client";

import { useActionState } from "react";
import { updateService } from "@/app/mes-services/[id]/actions";
import { INITIAL_ACTION_STATE } from "@/lib/actions/action-state";
import { TextField } from "@/components/ui/TextField";
import { TextAreaField } from "@/components/ui/TextAreaField";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { Alert } from "@/components/ui/Alert";
import { SERVICE_CATEGORIES } from "@/lib/services/categories";
import type { Service } from "@/lib/supabase/database.types";

export function EditServiceForm({ service }: { service: Service }) {
  const updateServiceWithId = updateService.bind(null, service.id);
  const [state, formAction] = useActionState(
    updateServiceWithId,
    INITIAL_ACTION_STATE,
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {state.error ? <Alert>{state.error}</Alert> : null}

      <TextField
        label="Titre du service"
        name="title"
        defaultValue={service.title}
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
          defaultValue={service.category}
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
        defaultValue={service.description}
        error={state.fieldErrors?.description?.[0]}
        required
      />

      <TextField
        label="Prix indicatif (€, facultatif)"
        name="priceFrom"
        type="number"
        min="0"
        step="0.01"
        defaultValue={service.price_from ?? ""}
        error={state.fieldErrors?.priceFrom?.[0]}
      />

      <TextField
        label="Ville"
        name="city"
        defaultValue={service.city ?? ""}
        error={state.fieldErrors?.city?.[0]}
      />

      <TextField
        label="Zone d'intervention"
        name="serviceArea"
        defaultValue={service.service_area ?? ""}
        error={state.fieldErrors?.serviceArea?.[0]}
      />

      <SubmitButton pendingLabel="Enregistrement...">
        Enregistrer
      </SubmitButton>
    </form>
  );
}
