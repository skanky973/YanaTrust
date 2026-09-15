"use client";

import { useActionState, useRef } from "react";
import { rescheduleIntervention } from "@/lib/actions/interventions";
import { INITIAL_ACTION_STATE } from "@/lib/actions/action-state";
import { TextField } from "@/components/ui/TextField";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { Alert } from "@/components/ui/Alert";
import type { Intervention } from "@/lib/supabase/database.types";

export function RescheduleForm({ intervention }: { intervention: Intervention }) {
  const rescheduleWithId = rescheduleIntervention.bind(null, intervention.id);
  const [state, formAction] = useActionState(rescheduleWithId, INITIAL_ACTION_STATE);
  const ignoreConflictRef = useRef<HTMLInputElement>(null);

  if (state.success) {
    return <Alert variant="success">Intervention reprogrammée.</Alert>;
  }

  return (
    <form action={formAction} className="flex flex-col gap-4">
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
            Reprogrammer quand même
          </button>
        </Alert>
      ) : state.error ? (
        <Alert>{state.error}</Alert>
      ) : null}

      <input ref={ignoreConflictRef} type="hidden" name="ignoreConflict" defaultValue="false" />

      <div className="grid grid-cols-2 gap-3">
        <TextField
          label="Nouvelle date"
          name="scheduledDate"
          type="date"
          defaultValue={intervention.scheduled_date}
          required
        />
        <TextField
          label="Nouvelle heure"
          name="startTime"
          type="time"
          defaultValue={intervention.start_time.slice(0, 5)}
          required
        />
      </div>

      <TextField
        label="Durée estimée (minutes)"
        name="durationMinutes"
        type="number"
        min="15"
        step="15"
        defaultValue={intervention.duration_minutes}
        required
      />

      <SubmitButton pendingLabel="Enregistrement...">
        Confirmer la reprogrammation
      </SubmitButton>
    </form>
  );
}
