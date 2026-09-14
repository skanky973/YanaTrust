"use client";

import { useActionState } from "react";
import { submitReview } from "@/app/messages/[id]/avis/actions";
import { INITIAL_ACTION_STATE } from "@/lib/actions/action-state";
import { TextAreaField } from "@/components/ui/TextAreaField";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { Alert } from "@/components/ui/Alert";
import type { Review } from "@/lib/supabase/database.types";

function RatingSelect({
  name,
  label,
  defaultValue,
  required,
  error,
}: {
  name: string;
  label: string;
  defaultValue?: number | null;
  required?: boolean;
  error?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={name} className="text-sm font-medium text-brand-ink">
        {label}
      </label>
      <select
        id={name}
        name={name}
        defaultValue={defaultValue ?? ""}
        required={required}
        className="rounded-xl border border-brand-ink/15 bg-white px-4 py-3 text-base text-brand-ink focus:border-brand-green focus:outline-none focus:ring-2 focus:ring-brand-green/30"
      >
        <option value="">{required ? "Choisir une note" : "Non renseigné"}</option>
        {[1, 2, 3, 4, 5].map((n) => (
          <option key={n} value={n}>
            {n} / 5
          </option>
        ))}
      </select>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  );
}

export function ReviewForm({
  providerId,
  conversationId,
  providerName,
  existingReview,
}: {
  providerId: string;
  conversationId: string;
  providerName: string;
  existingReview: Review | null;
}) {
  const submitReviewBound = submitReview.bind(null, providerId, conversationId);
  const [state, formAction] = useActionState(
    submitReviewBound,
    INITIAL_ACTION_STATE,
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {state.error ? <Alert>{state.error}</Alert> : null}

      <p className="text-sm text-brand-ink/70">
        Votre avis sur <span className="font-semibold">{providerName}</span>
      </p>

      <RatingSelect
        name="rating"
        label="Note globale"
        defaultValue={existingReview?.rating}
        required
        error={state.fieldErrors?.rating?.[0]}
      />

      <TextAreaField
        label="Commentaire (facultatif)"
        name="comment"
        defaultValue={existingReview?.comment ?? ""}
        placeholder="Partagez votre expérience..."
        error={state.fieldErrors?.comment?.[0]}
      />

      <RatingSelect
        name="punctuality"
        label="Ponctualité (facultatif)"
        defaultValue={existingReview?.punctuality}
        error={state.fieldErrors?.punctuality?.[0]}
      />

      <RatingSelect
        name="quality"
        label="Qualité (facultatif)"
        defaultValue={existingReview?.quality}
        error={state.fieldErrors?.quality?.[0]}
      />

      <RatingSelect
        name="communication"
        label="Communication (facultatif)"
        defaultValue={existingReview?.communication}
        error={state.fieldErrors?.communication?.[0]}
      />

      <SubmitButton pendingLabel="Envoi...">
        {existingReview ? "Mettre à jour mon avis" : "Publier mon avis"}
      </SubmitButton>
    </form>
  );
}
