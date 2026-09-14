"use client";

import { useActionState } from "react";
import { requestPasswordReset } from "@/app/mot-de-passe-oublie/actions";
import { INITIAL_ACTION_STATE } from "@/lib/actions/action-state";
import { TextField } from "@/components/ui/TextField";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { Alert } from "@/components/ui/Alert";

export function ForgotPasswordForm() {
  const [state, formAction] = useActionState(
    requestPasswordReset,
    INITIAL_ACTION_STATE,
  );

  if (state.success) {
    return (
      <Alert variant="success">
        Si un compte existe avec cet e-mail, un lien de réinitialisation
        vient de vous être envoyé.
      </Alert>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {state.error ? <Alert>{state.error}</Alert> : null}

      <TextField
        label="E-mail"
        name="email"
        type="email"
        autoComplete="email"
        error={state.fieldErrors?.email?.[0]}
        required
      />

      <SubmitButton pendingLabel="Envoi en cours...">
        Envoyer le lien de réinitialisation
      </SubmitButton>
    </form>
  );
}
