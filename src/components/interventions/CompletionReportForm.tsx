"use client";

import { useActionState } from "react";
import { submitCompletionReport } from "@/lib/actions/interventions";
import { INITIAL_ACTION_STATE } from "@/lib/actions/action-state";
import { TextAreaField } from "@/components/ui/TextAreaField";
import { TextField } from "@/components/ui/TextField";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { Alert } from "@/components/ui/Alert";

export function CompletionReportForm({ interventionId }: { interventionId: string }) {
  const submitWithId = submitCompletionReport.bind(null, interventionId);
  const [state, formAction] = useActionState(submitWithId, INITIAL_ACTION_STATE);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {state.error ? <Alert>{state.error}</Alert> : null}

      <TextAreaField
        label="Compte-rendu : travaux effectués"
        name="workNotes"
        placeholder="Décrivez ce qui a été fait..."
        error={state.fieldErrors?.workNotes?.[0]}
        required
      />

      <TextAreaField
        label="Matériel utilisé (facultatif)"
        name="materialsUsed"
        placeholder="Ex : 2 prises, 5m de câble..."
        error={state.fieldErrors?.materialsUsed?.[0]}
      />

      <TextField
        label="Montant final (€, facultatif)"
        name="finalPrice"
        type="number"
        min="0"
        step="0.01"
        error={state.fieldErrors?.finalPrice?.[0]}
      />

      <div className="flex flex-col gap-1.5">
        <label htmlFor="beforePhotos" className="text-sm font-medium text-brand-ink">
          Photos avant (facultatif)
        </label>
        <input
          id="beforePhotos"
          name="beforePhotos"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          className="rounded-xl border border-brand-ink/15 bg-white px-4 py-3 text-sm text-brand-ink file:mr-3 file:rounded-lg file:border-0 file:bg-brand-green-dark file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-brand-cream"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="afterPhotos" className="text-sm font-medium text-brand-ink">
          Photos après (facultatif)
        </label>
        <input
          id="afterPhotos"
          name="afterPhotos"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          className="rounded-xl border border-brand-ink/15 bg-white px-4 py-3 text-sm text-brand-ink file:mr-3 file:rounded-lg file:border-0 file:bg-brand-green-dark file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-brand-cream"
        />
      </div>

      <label className="flex items-center gap-3 rounded-xl border border-brand-ink/15 bg-white px-4 py-3">
        <input
          type="checkbox"
          name="needsFollowup"
          className="h-5 w-5 rounded border-brand-ink/30 text-brand-green focus:ring-brand-green"
        />
        <span className="text-sm text-brand-ink">
          Une autre intervention est nécessaire
        </span>
      </label>

      <SubmitButton pendingLabel="Enregistrement...">
        Terminer et demander la validation du client
      </SubmitButton>
    </form>
  );
}
