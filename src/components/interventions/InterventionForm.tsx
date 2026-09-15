"use client";

import { useActionState, useRef } from "react";
import { createIntervention } from "@/lib/actions/interventions";
import { INITIAL_ACTION_STATE } from "@/lib/actions/action-state";
import { TextField } from "@/components/ui/TextField";
import { TextAreaField } from "@/components/ui/TextAreaField";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { Alert } from "@/components/ui/Alert";
import { ClientPicker } from "@/components/interventions/ClientPicker";
import { SERVICE_CATEGORIES } from "@/lib/services/categories";

export function InterventionForm() {
  const [state, formAction] = useActionState(
    createIntervention,
    INITIAL_ACTION_STATE,
  );
  const ignoreConflictRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-4">
      {state.error === "CONFLICT" ? (
        <Alert>
          Vous avez déjà une intervention sur ce créneau.{" "}
          <button
            type="submit"
            onClick={() => {
              if (ignoreConflictRef.current) {
                ignoreConflictRef.current.value = "true";
              }
            }}
            className="font-semibold underline"
          >
            Planifier quand même
          </button>
        </Alert>
      ) : state.error ? (
        <Alert>{state.error}</Alert>
      ) : null}

      <input ref={ignoreConflictRef} type="hidden" name="ignoreConflict" defaultValue="false" />

      <ClientPicker error={state.fieldErrors?.clientId?.[0]} />

      <TextField
        label="Titre du service"
        name="title"
        placeholder="Ex : Réparation de volet roulant"
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
          <p className="text-sm text-red-600">{state.fieldErrors.category[0]}</p>
        ) : null}
      </div>

      <TextAreaField
        label="Description (facultatif)"
        name="description"
        placeholder="Détails de l'intervention..."
        error={state.fieldErrors?.description?.[0]}
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

      <TextField
        label="Durée estimée (minutes)"
        name="durationMinutes"
        type="number"
        min="15"
        step="15"
        defaultValue="60"
        error={state.fieldErrors?.durationMinutes?.[0]}
        required
      />

      <TextField
        label="Adresse de l'intervention"
        name="address"
        placeholder="Adresse complète"
        error={state.fieldErrors?.address?.[0]}
      />

      <TextField
        label="Téléphone du client (facultatif)"
        name="clientPhone"
        type="tel"
        error={state.fieldErrors?.clientPhone?.[0]}
      />

      <TextField
        label="Prix convenu (€, facultatif)"
        name="price"
        type="number"
        min="0"
        step="0.01"
        error={state.fieldErrors?.price?.[0]}
      />

      <SubmitButton pendingLabel="Création...">
        Créer l&rsquo;intervention
      </SubmitButton>
    </form>
  );
}
