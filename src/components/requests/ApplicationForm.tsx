"use client";

import { useActionState } from "react";
import { submitApplication, updateMyApplication } from "@/lib/actions/applications";
import { INITIAL_ACTION_STATE } from "@/lib/actions/action-state";
import { TextAreaField } from "@/components/ui/TextAreaField";
import { TextField } from "@/components/ui/TextField";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { Alert } from "@/components/ui/Alert";
import type { RequestApplication } from "@/lib/supabase/database.types";

export function ApplicationForm({
  requestId,
  existingApplication,
}: {
  requestId: string;
  existingApplication?: RequestApplication | null;
}) {
  const isEdit = !!existingApplication;
  const action = isEdit
    ? updateMyApplication.bind(null, existingApplication!.id)
    : submitApplication.bind(null, requestId);
  const [state, formAction] = useActionState(action, INITIAL_ACTION_STATE);

  if (existingApplication && existingApplication.status !== "pending") {
    return (
      <p className="rounded-xl bg-white shadow-sm shadow-black/5 p-4 text-sm text-brand-ink/70">
        Vous avez déjà postulé à cette demande. Statut de votre candidature :{" "}
        <strong>{existingApplication.status}</strong>.
      </p>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-4 rounded-xl bg-white shadow-sm shadow-black/5 p-4">
      <h2 className="font-semibold text-brand-ink">
        {isEdit ? "Modifier ma candidature" : "Postuler à cette demande"}
      </h2>

      {state.error ? <Alert>{state.error}</Alert> : null}
      {state.success ? (
        <Alert variant="success">
          {isEdit ? "Votre candidature a été mise à jour." : "Votre candidature a été envoyée."}
        </Alert>
      ) : null}

      <TextAreaField
        label="Votre message"
        name="message"
        placeholder="Présentez-vous et expliquez comment vous pouvez aider..."
        defaultValue={existingApplication?.message}
        error={state.fieldErrors?.message?.[0]}
        required
      />

      <TextField
        label="Prix proposé (€, facultatif)"
        name="proposedPrice"
        type="number"
        min="0"
        step="0.01"
        defaultValue={existingApplication?.proposed_price ?? undefined}
        error={state.fieldErrors?.proposedPrice?.[0]}
      />

      <TextField
        label="Durée estimée (minutes, facultatif)"
        name="estimatedDurationMinutes"
        type="number"
        min="1"
        step="1"
        defaultValue={existingApplication?.estimated_duration_minutes ?? undefined}
        error={state.fieldErrors?.estimatedDurationMinutes?.[0]}
      />

      <TextField
        label="Note complémentaire (facultatif)"
        name="note"
        defaultValue={existingApplication?.note ?? undefined}
        error={state.fieldErrors?.note?.[0]}
      />

      <SubmitButton pendingLabel="Envoi...">
        {isEdit ? "Enregistrer les modifications" : "Envoyer ma candidature"}
      </SubmitButton>
    </form>
  );
}
