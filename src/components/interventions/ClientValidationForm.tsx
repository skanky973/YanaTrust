"use client";

import { useActionState, useState } from "react";
import { submitClientValidation } from "@/lib/actions/interventions";
import { INITIAL_ACTION_STATE } from "@/lib/actions/action-state";
import { TextAreaField } from "@/components/ui/TextAreaField";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";

export function ClientValidationForm({ interventionId }: { interventionId: string }) {
  const submitWithId = submitClientValidation.bind(null, interventionId);
  const [state, formAction] = useActionState(submitWithId, INITIAL_ACTION_STATE);
  const [decision, setDecision] = useState<"confirm" | "problem" | null>(null);

  if (state.success) {
    return (
      <Alert variant="success">
        Merci, votre réponse a été enregistrée.
      </Alert>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {state.error ? <Alert>{state.error}</Alert> : null}

      <p className="text-sm font-medium text-brand-ink">
        L&rsquo;intervention est-elle terminée à votre satisfaction ?
      </p>

      <input type="hidden" name="decision" value={decision ?? ""} />

      <div className="flex gap-2">
        <Button
          type="button"
          variant={decision === "confirm" ? "primary" : "ghost"}
          className="flex-1"
          onClick={() => setDecision("confirm")}
        >
          Oui, tout est bon
        </Button>
        <Button
          type="button"
          variant={decision === "problem" ? "primary" : "ghost"}
          className="flex-1"
          onClick={() => setDecision("problem")}
        >
          Signaler un problème
        </Button>
      </div>

      {decision ? (
        <>
          <TextAreaField
            label={decision === "confirm" ? "Commentaire (facultatif)" : "Décrivez le problème"}
            name="comment"
            error={state.fieldErrors?.comment?.[0]}
            required={decision === "problem"}
          />

          {decision === "confirm" ? (
            <div className="flex flex-col gap-1.5">
              <label htmlFor="rating" className="text-sm font-medium text-brand-ink">
                Note au prestataire (facultatif)
              </label>
              <select
                id="rating"
                name="rating"
                defaultValue=""
                className="rounded-xl border border-brand-ink/15 bg-white px-4 py-3 text-base text-brand-ink focus:border-brand-green focus:outline-none focus:ring-2 focus:ring-brand-green/30"
              >
                <option value="">Non renseigné</option>
                {[1, 2, 3, 4, 5].map((n) => (
                  <option key={n} value={n}>
                    {n} / 5
                  </option>
                ))}
              </select>
            </div>
          ) : null}

          <SubmitButton pendingLabel="Envoi...">
            {decision === "confirm" ? "Confirmer la validation" : "Envoyer le signalement"}
          </SubmitButton>
        </>
      ) : null}
    </form>
  );
}
