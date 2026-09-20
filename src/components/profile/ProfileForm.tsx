"use client";

import { useActionState, useEffect, useState } from "react";
import { Camera } from "lucide-react";
import { compresserImage } from "@/lib/images/compress";
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

  // Aperçu local de la photo choisie, avant tout envoi au serveur : on voit
  // immédiatement ce qu'on a sélectionné, et on peut corriger si c'est la
  // mauvaise image.
  const [apercu, setApercu] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (apercu) URL.revokeObjectURL(apercu);
    };
  }, [apercu]);

  const photoAffichee = apercu ?? profile.avatar_url;

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {state.error ? <Alert>{state.error}</Alert> : null}
      {state.success ? (
        <Alert variant="success">Profil mis à jour.</Alert>
      ) : null}

      <div className="flex flex-col items-center gap-2">
        <label className="group relative cursor-pointer">
          {photoAffichee ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={photoAffichee}
              alt="Votre photo de profil"
              className="h-24 w-24 rounded-full object-cover"
            />
          ) : (
            <span className="flex h-24 w-24 items-center justify-center rounded-full bg-brand-green/10 text-brand-green-dark">
              <Camera className="h-8 w-8" aria-hidden="true" />
            </span>
          )}
          <span className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-brand-green-dark text-brand-cream shadow-sm">
            <Camera className="h-4 w-4" aria-hidden="true" />
          </span>
          <input
            type="file"
            name="avatar"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            onChange={async (e) => {
              const input = e.target;
              const file = input.files?.[0];

              if (!file) {
                setApercu(null);
                return;
              }

              // La photo est réduite avant d'être remise dans le champ, si bien
              // que c'est la version légère qui part au serveur lors de l'envoi
              // du formulaire.
              const reduite = await compresserImage(file);
              const transfert = new DataTransfer();
              transfert.items.add(reduite);
              input.files = transfert.files;

              setApercu(URL.createObjectURL(reduite));
            }}
          />
        </label>
        <p className="text-center text-xs text-brand-ink/70">
          {profile.avatar_url
            ? "Appuyez sur la photo pour la changer"
            : "Ajoutez une photo : elle est demandée pour publier ou réserver"}
        </p>
      </div>

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
