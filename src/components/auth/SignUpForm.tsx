"use client";

import { useActionState } from "react";
import { signUp } from "@/app/inscription/actions";
import { INITIAL_ACTION_STATE } from "@/lib/actions/action-state";
import { TextField } from "@/components/ui/TextField";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { Alert } from "@/components/ui/Alert";

export function SignUpForm() {
  const [state, formAction] = useActionState(signUp, INITIAL_ACTION_STATE);

  if (state.success) {
    return (
      <Alert variant="success">
        Compte créé ! Vérifiez votre boîte e-mail pour confirmer votre
        inscription avant de vous connecter.
      </Alert>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {state.error ? <Alert>{state.error}</Alert> : null}

      <div className="grid grid-cols-2 gap-4">
        <TextField
          label="Prénom"
          name="firstName"
          autoComplete="given-name"
          error={state.fieldErrors?.firstName?.[0]}
          required
        />
        <TextField
          label="Nom"
          name="lastName"
          autoComplete="family-name"
          error={state.fieldErrors?.lastName?.[0]}
          required
        />
      </div>

      <TextField
        label="E-mail"
        name="email"
        type="email"
        autoComplete="email"
        error={state.fieldErrors?.email?.[0]}
        required
      />

      <TextField
        label="Téléphone"
        name="phone"
        type="tel"
        autoComplete="tel"
        placeholder="0694 00 00 00"
        error={state.fieldErrors?.phone?.[0]}
        required
      />

      <TextField
        label="Ville"
        name="city"
        autoComplete="address-level2"
        placeholder="Saint-Laurent-du-Maroni"
        error={state.fieldErrors?.city?.[0]}
        required
      />

      <TextField
        label="Mot de passe"
        name="password"
        type="password"
        autoComplete="new-password"
        error={state.fieldErrors?.password?.[0]}
        required
      />

      <SubmitButton pendingLabel="Création du compte...">
        Créer mon compte
      </SubmitButton>
    </form>
  );
}
