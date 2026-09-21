import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ChevronLeft, Download, Pencil, ShieldCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { SupprimerCompteForm } from "@/components/profile/SupprimerCompteForm";

export const metadata: Metadata = {
  title: "Mes données — YanaTrust",
};

export default async function MesDonneesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/connexion?suivant=/profil/donnees");
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-4 py-8">
      <Link
        href="/profil"
        className="flex items-center gap-1 text-sm font-medium text-brand-green-dark"
      >
        <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        Retour au profil
      </Link>

      <div>
        <h1 className="text-2xl font-bold text-brand-green-dark">Mes données</h1>
        <p className="mt-1 text-sm text-brand-ink/70">
          Consulter, corriger ou effacer ce que YanaTrust détient sur vous.
        </p>
      </div>

      <section className="flex flex-col gap-2 rounded-2xl bg-white p-4 shadow-sm shadow-black/5">
        <h2 className="flex items-center gap-2 font-semibold text-brand-ink">
          <Pencil className="h-4 w-4 text-brand-green-dark" aria-hidden="true" />
          Corriger mes informations
        </h2>
        <p className="text-sm text-brand-ink/70">
          Nom, photo, ville, téléphone, biographie : tout se modifie depuis
          votre profil.
        </p>
        <Link
          href="/profil/modifier"
          className="mt-1 self-start rounded-xl border border-brand-green-dark px-4 py-2 text-sm font-semibold text-brand-green-dark"
        >
          Modifier mon profil
        </Link>
      </section>

      <section className="flex flex-col gap-2 rounded-2xl bg-white p-4 shadow-sm shadow-black/5">
        <h2 className="flex items-center gap-2 font-semibold text-brand-ink">
          <Download className="h-4 w-4 text-brand-green-dark" aria-hidden="true" />
          Récupérer mes données
        </h2>
        <p className="text-sm text-brand-ink/70">
          Téléchargez un fichier contenant l&rsquo;ensemble de vos données :
          profil, annonces, demandes, messages envoyés, avis, trajets,
          réservations et notifications.
        </p>
        <a
          href="/api/mes-donnees"
          download
          className="mt-1 self-start rounded-xl bg-brand-green-dark px-4 py-2 text-sm font-semibold text-brand-cream"
        >
          Télécharger mes données
        </a>
      </section>

      <section className="flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-sm shadow-black/5">
        <h2 className="font-semibold text-brand-ink">Supprimer mon compte</h2>
        <p className="text-sm text-brand-ink/70">
          Vos informations personnelles sont effacées : nom, photo, téléphone,
          ville, biographie. Votre adresse e-mail est remplacée et la connexion
          devient impossible. Vos annonces sont retirées du site.
        </p>
        <p className="flex items-start gap-2 rounded-xl bg-brand-gold/15 px-3 py-2 text-xs text-brand-ink/80">
          <ShieldCheck
            className="mt-0.5 h-4 w-4 shrink-0 text-brand-green-dark"
            aria-hidden="true"
          />
          <span>
            Les réservations déjà payées ne sont pas effacées : elles
            constituent des pièces comptables, et leur suppression laisserait
            aussi des trous dans l&rsquo;historique des personnes avec qui vous
            avez voyagé. Elles ne portent plus votre nom.
          </span>
        </p>
        <p className="text-sm font-semibold text-brand-ink">
          Cette action est définitive.
        </p>
        <SupprimerCompteForm />
      </section>

      <p className="text-xs text-brand-ink/65">
        Pour les autres droits — opposition, limitation, réclamation — voyez la{" "}
        <Link href="/confidentialite" className="text-brand-green-dark underline">
          politique de confidentialité
        </Link>
        .
      </p>
    </div>
  );
}
