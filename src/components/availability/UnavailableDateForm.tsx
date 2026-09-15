"use client";

import { useActionState } from "react";
import { addUnavailableDate } from "@/lib/actions/availability";
import { INITIAL_ACTION_STATE } from "@/lib/actions/action-state";
import { TextField } from "@/components/ui/TextField";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { Alert } from "@/components/ui/Alert";

export function UnavailableDateForm() {
  const [state, formAction] = useActionState(addUnavailableDate, INITIAL_ACTION_STATE);

  return (
    <form action={formAction} className="flex flex-col gap-3">
      {state.error ? <Alert>{state.error}</Alert> : null}

      <TextField
        label="Date indisponible"
        name="date"
        type="date"
        error={state.fieldErrors?.date?.[0]}
        required
      />
      <TextField
        label="Motif (facultatif)"
        name="reason"
        placeholder="Ex : Congés"
        error={state.fieldErrors?.reason?.[0]}
      />

      <SubmitButton pendingLabel="Ajout...">Bloquer cette date</SubmitButton>
    </form>
  );
}
