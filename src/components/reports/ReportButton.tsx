"use client";

import { useActionState, useState } from "react";
import { submitReport } from "@/lib/actions/reports";
import { INITIAL_ACTION_STATE } from "@/lib/actions/action-state";
import { SubmitButton } from "@/components/ui/SubmitButton";

export function ReportButton({
  targetType,
  targetId,
  label = "Signaler",
  className = "",
}: {
  targetType: "profile" | "service" | "message";
  targetId: string;
  label?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const submitReportBound = submitReport.bind(null, targetType, targetId);
  const [state, formAction] = useActionState(
    submitReportBound,
    INITIAL_ACTION_STATE,
  );

  if (state.success) {
    return (
      <p className={`text-xs text-brand-ink/65 ${className}`}>
        Signalement envoyé, merci.
      </p>
    );
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`text-xs text-brand-ink/65 underline ${className}`}
      >
        {label}
      </button>
    );
  }

  return (
    <form action={formAction} className={`flex flex-col gap-2 ${className}`}>
      {state.error ? (
        <p className="text-xs text-red-600">{state.error}</p>
      ) : null}
      <textarea
        name="reason"
        required
        minLength={5}
        maxLength={1000}
        placeholder="Motif du signalement..."
        className="min-h-16 rounded-lg border border-brand-ink/15 bg-white px-3 py-2 text-xs text-brand-ink placeholder:text-brand-ink/65 focus:border-brand-green focus:outline-none focus:ring-2 focus:ring-brand-green/30"
      />
      {state.fieldErrors?.reason?.[0] ? (
        <p className="text-xs text-red-600">{state.fieldErrors.reason[0]}</p>
      ) : null}
      <div className="flex gap-2">
        <SubmitButton
          pendingLabel="Envoi..."
          className="px-3 py-1.5 text-xs"
        >
          Envoyer le signalement
        </SubmitButton>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-xl px-3 py-1.5 text-xs text-brand-ink/65"
        >
          Annuler
        </button>
      </div>
    </form>
  );
}
