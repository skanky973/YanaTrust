"use client";

import { useActionState } from "react";
import Link from "next/link";
import { updatePassword } from "@/app/reinitialiser-mot-de-passe/actions";
import { INITIAL_ACTION_STATE } from "@/lib/actions/action-state";
import { TextField } from "@/components/ui/TextField";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { Alert } from "@/components/ui/Alert";

export function ResetPasswordForm() {
  const [state, formAction] = useActionState(
    updatePassword,
    INITIAL_ACTION_STATE,
  );

  if (state.success) {
    return (
      <div className="flex flex-col gap-4">
        <Alert variant="success">
          Votre mot de passe a été mis à jour.
        </Alert>
        <Link
          href="/connexion"
          className="text-center text-sm font-semibold text-brand-green-dark"
        >
          Se connecter
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {state.error ? <Alert>{state.error}</Alert> : null}

      <TextField
        label="Nouveau mot de passe"
        name="password"
        type="password"
        autoComplete="new-password"
        error={state.fieldErrors?.password?.[0]}
        required
      />

      <TextField
        label="Confirmer le mot de passe"
        name="confirmPassword"
        type="password"
        autoComplete="new-password"
        error={state.fieldErrors?.confirmPassword?.[0]}
        required
      />

      <SubmitButton pendingLabel="Mise à jour...">
        Mettre à jour le mot de passe
      </SubmitButton>
    </form>
  );
}
