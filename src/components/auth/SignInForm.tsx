"use client";

import { useActionState } from "react";
import { signIn } from "@/app/connexion/actions";
import { INITIAL_ACTION_STATE } from "@/lib/actions/action-state";
import { TextField } from "@/components/ui/TextField";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { Alert } from "@/components/ui/Alert";
import Link from "next/link";

export function SignInForm({ next }: { next?: string }) {
  const [state, formAction] = useActionState(signIn, INITIAL_ACTION_STATE);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {state.error ? <Alert>{state.error}</Alert> : null}

      <input type="hidden" name="next" value={next ?? ""} />

      <TextField
        label="E-mail"
        name="email"
        type="email"
        autoComplete="email"
        error={state.fieldErrors?.email?.[0]}
        required
      />

      <TextField
        label="Mot de passe"
        name="password"
        type="password"
        autoComplete="current-password"
        error={state.fieldErrors?.password?.[0]}
        required
      />

      <div className="text-right">
        <Link
          href="/mot-de-passe-oublie"
          className="text-sm font-medium text-brand-green-dark"
        >
          Mot de passe oublié ?
        </Link>
      </div>

      <SubmitButton pendingLabel="Connexion...">Se connecter</SubmitButton>
    </form>
  );
}
