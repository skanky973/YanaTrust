"use client";

import { useActionState } from "react";
import { updateProfile } from "@/app/profil/modifier/actions";
import { INITIAL_ACTION_STATE } from "@/lib/actions/action-state";
import { TextField } from "@/components/ui/TextField";
import { TextAreaField } from "@/components/ui/TextAreaField";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { Alert } from "@/components/ui/Alert";
import type { ProfileWithPhone } from "@/lib/profiles/queries";

export function ProfileForm({ profile }: { profile: ProfileWithPhone }) {
  const [state, formAction] = useActionState(
    updateProfile,
    INITIAL_ACTION_STATE,
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {state.error ? <Alert>{state.error}</Alert> : null}
      {state.success ? (
        <Alert variant="success">Profil mis à jour.</Alert>
      ) : null}

      <div className="grid grid-cols-2 gap-4">
        <TextField
          label="Prénom"
          name="firstName"
          defaultValue={profile.first_name}
          error={state.fieldErrors?.firstName?.[0]}
          required
        />
        <TextField
          label="Nom"
          name="lastName"
          defaultValue={profile.last_name}
          error={state.fieldErrors?.lastName?.[0]}
          required
        />
      </div>

      <TextField
        label="Téléphone"
        name="phone"
        type="tel"
        defaultValue={profile.phone ?? ""}
        error={state.fieldErrors?.phone?.[0]}
      />

      <TextField
        label="Ville"
        name="city"
        defaultValue={profile.city ?? ""}
        placeholder="Saint-Laurent-du-Maroni"
        error={state.fieldErrors?.city?.[0]}
      />

      <TextField
        label="Zone d'intervention"
        name="serviceArea"
        defaultValue={profile.service_area ?? ""}
        placeholder="Saint-Laurent-du-Maroni et environs"
        error={state.fieldErrors?.serviceArea?.[0]}
      />

      <TextAreaField
        label="Biographie"
        name="bio"
        defaultValue={profile.bio ?? ""}
        placeholder="Présentez-vous en quelques mots..."
        error={state.fieldErrors?.bio?.[0]}
      />

      <label className="flex items-center gap-3 rounded-xl border border-brand-ink/15 bg-white px-4 py-3">
        <input
          type="checkbox"
          name="isProvider"
          defaultChecked={profile.is_provider}
          className="h-5 w-5 rounded border-brand-ink/30 text-brand-green focus:ring-brand-green"
        />
        <span className="text-sm text-brand-ink">
          Je propose des services sur YanaTrust (statut prestataire)
        </span>
      </label>

      <SubmitButton pendingLabel="Enregistrement...">
        Enregistrer
      </SubmitButton>
    </form>
  );
}
