import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentProfile } from "@/lib/profiles/queries";
import { getProviderRatingSummary } from "@/lib/reviews/queries";
import { RatingBadge } from "@/components/reviews/RatingBadge";
import { LinkButton } from "@/components/ui/Button";
import { SignOutButton } from "@/components/layout/SignOutButton";

export const metadata: Metadata = {
  title: "Mon profil — YanaTrust",
};

function initials(firstName: string, lastName: string) {
  return `${firstName[0] ?? ""}${lastName[0] ?? ""}`.toUpperCase() || "?";
}

export default async function ProfilPage() {
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect("/connexion?suivant=/profil");
  }

  const ratingSummary = profile.is_provider
    ? await getProviderRatingSummary(profile.id)
    : null;

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-4 py-8">
      <div className="flex items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-green-dark text-xl font-bold text-brand-cream">
          {initials(profile.first_name, profile.last_name)}
        </div>
        <div>
          <h1 className="text-xl font-bold text-brand-ink">
            {profile.first_name} {profile.last_name}
          </h1>
          <p className="text-sm text-brand-ink/70">
            {profile.city || "Ville non renseignée"}
          </p>
          {profile.is_provider ? (
            <div className="mt-1 flex items-center gap-2">
              <span className="inline-block rounded-full bg-brand-gold/30 px-2 py-0.5 text-xs font-semibold text-brand-green-dark">
                Prestataire
              </span>
              {ratingSummary ? <RatingBadge summary={ratingSummary} /> : null}
            </div>
          ) : null}
        </div>
      </div>

      {profile.bio ? (
        <p className="rounded-xl bg-white p-4 text-sm text-brand-ink/80">
          {profile.bio}
        </p>
      ) : null}

      <dl className="grid grid-cols-1 gap-3 rounded-xl bg-white p-4 text-sm">
        <div className="flex justify-between">
          <dt className="text-brand-ink/60">Téléphone</dt>
          <dd className="font-medium text-brand-ink">
            {profile.phone || "—"}{" "}
            {profile.phone && !profile.phone_verified ? (
              <span className="text-brand-ink/40">(non vérifié)</span>
            ) : null}
          </dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-brand-ink/60">Zone d&rsquo;intervention</dt>
          <dd className="font-medium text-brand-ink">
            {profile.service_area || "—"}
          </dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-brand-ink/60">Identité vérifiée</dt>
          <dd className="font-medium text-brand-ink">
            {profile.identity_verified ? "Oui" : "Non"}
          </dd>
        </div>
      </dl>

      <div className="flex flex-col gap-3">
        <LinkButton href="/profil/modifier" variant="primary">
          Modifier mon profil
        </LinkButton>
        <LinkButton href="/mes-services" variant="ghost">
          Mes services
        </LinkButton>
        <LinkButton href="/mes-demandes" variant="ghost">
          Mes demandes
        </LinkButton>
        <SignOutButton />
      </div>

      <p className="text-center text-xs text-brand-ink/50">
        Membre depuis le{" "}
        {new Date(profile.created_at).toLocaleDateString("fr-FR")}
      </p>

      <Link href="/" className="text-center text-sm text-brand-green-dark">
        Retour à l&rsquo;accueil
      </Link>
    </div>
  );
}
