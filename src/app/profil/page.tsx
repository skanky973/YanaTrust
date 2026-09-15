import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  BadgeCheck,
  ChevronRight,
  Pencil,
  Wrench,
  ClipboardList,
  Heart,
  Calendar,
} from "lucide-react";
import { getCurrentProfile } from "@/lib/profiles/queries";
import { getProviderRatingSummary } from "@/lib/reviews/queries";
import { getProviderTrustScore } from "@/lib/trust/queries";
import { getInterventionsAwaitingMyValidation } from "@/lib/interventions/queries";
import { createClient } from "@/lib/supabase/server";
import { RatingBadge } from "@/components/reviews/RatingBadge";
import { TrustScoreBadge } from "@/components/trust/TrustScoreBadge";
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

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [ratingSummary, trustScore] = profile.is_provider
    ? await Promise.all([
        getProviderRatingSummary(profile.id),
        getProviderTrustScore(profile.id),
      ])
    : [null, null];

  const awaitingValidation = await getInterventionsAwaitingMyValidation();

  const menuItems = [
    ...(profile.is_provider
      ? [{ href: "/planning", label: "Mon planning", icon: Calendar }]
      : []),
    { href: "/profil/modifier", label: "Modifier mon profil", icon: Pencil },
    { href: "/mes-services", label: "Mes services", icon: Wrench },
    { href: "/mes-demandes", label: "Mes demandes", icon: ClipboardList },
    { href: "/favoris", label: "Mes favoris", icon: Heart },
  ];

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-4 py-8">
      <div className="flex items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-green-dark text-xl font-bold text-brand-cream">
          {initials(profile.first_name, profile.last_name)}
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <h1 className="text-xl font-bold text-brand-ink">
              {profile.first_name} {profile.last_name}
            </h1>
            {profile.identity_verified ? (
              <BadgeCheck
                className="h-5 w-5 text-brand-green"
                aria-label="Identité vérifiée"
              />
            ) : null}
          </div>
          <p className="text-sm text-brand-ink/70">
            {profile.city || "Ville non renseignée"}
          </p>
          {profile.is_provider ? (
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <span className="inline-block rounded-full bg-brand-gold/30 px-2 py-0.5 text-xs font-semibold text-brand-green-dark">
                Prestataire
              </span>
              {ratingSummary ? <RatingBadge summary={ratingSummary} /> : null}
            </div>
          ) : null}
        </div>
      </div>

      {trustScore !== null ? <TrustScoreBadge score={trustScore} /> : null}

      {profile.bio ? (
        <p className="rounded-xl bg-white shadow-sm shadow-black/5 p-4 text-sm text-brand-ink/80">
          {profile.bio}
        </p>
      ) : null}

      <dl className="grid grid-cols-1 gap-3 rounded-xl bg-white shadow-sm shadow-black/5 p-4 text-sm">
        <div className="flex justify-between">
          <dt className="text-brand-ink/60">Téléphone</dt>
          <dd className="font-medium text-brand-ink">
            {profile.phone || "—"}{" "}
            {profile.phone && !profile.phone_verified ? (
              <span className="text-brand-ink/40">(non vérifié)</span>
            ) : null}
          </dd>
        </div>
        {user?.email ? (
          <div className="flex justify-between">
            <dt className="text-brand-ink/60">E-mail</dt>
            <dd className="font-medium text-brand-ink">{user.email}</dd>
          </div>
        ) : null}
        <div className="flex justify-between">
          <dt className="text-brand-ink/60">Zone d&rsquo;intervention</dt>
          <dd className="font-medium text-brand-ink">
            {profile.service_area || "—"}
          </dd>
        </div>
      </dl>

      {awaitingValidation.length > 0 ? (
        <div className="flex flex-col gap-2 rounded-xl bg-brand-gold/15 p-4">
          <p className="text-sm font-semibold text-brand-green-dark">
            {awaitingValidation.length} intervention
            {awaitingValidation.length > 1 ? "s" : ""} en attente de votre validation
          </p>
          {awaitingValidation.map((i) => (
            <Link
              key={i.id}
              href={`/planning/${i.id}`}
              className="text-sm text-brand-ink underline"
            >
              {i.title} — {i.provider ? `${i.provider.first_name} ${i.provider.last_name}` : ""}
            </Link>
          ))}
        </div>
      ) : null}

      <nav className="flex flex-col overflow-hidden rounded-xl bg-white shadow-sm shadow-black/5">
        {menuItems.map(({ href, label, icon: Icon }, i) => (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-3 px-4 py-3.5 text-sm font-medium text-brand-ink ${
              i > 0 ? "border-t border-brand-ink/8" : ""
            }`}
          >
            <Icon className="h-5 w-5 text-brand-green-dark" aria-hidden="true" />
            <span className="flex-1">{label}</span>
            <ChevronRight className="h-4 w-4 text-brand-ink/30" aria-hidden="true" />
          </Link>
        ))}
      </nav>

      <SignOutButton />

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
