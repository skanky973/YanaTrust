"use client";

import { useState } from "react";
import { supprimerMonCompte } from "@/lib/actions/account";
import { SubmitButton } from "@/components/ui/SubmitButton";

const CONFIRMATION = "SUPPRIMER";

/**
 * La suppression demande de recopier un mot plutôt que de cocher une case ou
 * de confirmer dans une fenêtre du navigateur : c'est irréversible, et le
 * geste doit être délibéré. La saisie est aussi accessible au clavier et aux
 * lecteurs d'écran, ce que confirm() ne garantit pas.
 */
export function SupprimerCompteForm() {
  const [saisie, setSaisie] = useState("");
  const confirme = saisie.trim().toUpperCase() === CONFIRMATION;

  return (
    <form action={supprimerMonCompte} className="flex flex-col gap-2">
      <label
        htmlFor="confirmation-suppression"
        className="text-sm font-medium text-brand-ink"
      >
        Pour confirmer, écrivez {CONFIRMATION} ci-dessous
      </label>
      <input
        id="confirmation-suppression"
        name="confirmation"
        value={saisie}
        onChange={(e) => setSaisie(e.target.value)}
        autoComplete="off"
        aria-describedby="confirmation-aide"
        className="rounded-xl border border-brand-ink/15 bg-white px-4 py-3 text-base text-brand-ink placeholder:text-brand-ink/65 focus:border-brand-green focus:outline-none focus:ring-2 focus:ring-brand-green/30"
      />
      <p id="confirmation-aide" className="text-xs text-brand-ink/65">
        Le bouton reste inactif tant que le mot n&rsquo;est pas saisi.
      </p>

      <SubmitButton
        variant="danger"
        disabled={!confirme}
        pendingLabel="Suppression en cours..."
      >
        Supprimer définitivement mon compte
      </SubmitButton>
    </form>
  );
}
