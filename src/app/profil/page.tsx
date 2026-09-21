import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  BadgeCheck,
  Bell,
  ChevronRight,
  Pencil,
  Wrench,
  ClipboardList,
  Heart,
  Calendar,
  CalendarCheck,
  Search,
  FileCheck,
  ShieldAlert,
  Car,
  CreditCard,
  Ticket,
  ShieldCheck,
} from "lucide-react";
import { getCurrentProfile } from "@/lib/profiles/queries";
import { getProviderRatingSummary } from "@/lib/reviews/queries";
import { getProviderTrustScore } from "@/lib/trust/queries";
import { getInterventionsAwaitingMyValidation } from "@/lib/interventions/queries";
import { getUnreadNotificationCount } from "@/lib/notifications/queries";
import { getPendingReportCount } from "@/lib/moderation/queries";
import { createClient } from "@/lib/supabase/server";
import { RatingBadge } from "@/components/reviews/RatingBadge";
import { TrustScoreBadge } from "@/components/trust/TrustScoreBadge";
import { SignOutButton } from "@/components/layout/SignOutButton";
import { Avatar } from "@/components/ui/Avatar";

export const metadata: Metadata = {
  title: "Mon profil — YanaTrust",
};

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

  const [awaitingValidation, unreadCount, pendingReportCount] = await Promise.all([
    getInterventionsAwaitingMyValidation(),
    getUnreadNotificationCount(),
    profile.is_admin ? getPendingReportCount() : Promise.resolve(0),
  ]);

  const menuItems = [
    { href: "/notifications", label: "Notifications", icon: Bell, badge: unreadCount },
    ...(profile.is_admin
      ? [
          {
            href: "/admin/signalements",
            label: "Signalements",
            icon: ShieldAlert,
            badge: pendingReportCount,
          },
        ]
      : []),
    ...(profile.is_provider
      ? [
          { href: "/planning", label: "Mon planning", icon: Calendar },
          { href: "/demandes", label: "Demandes ouvertes", icon: Search },
          { href: "/mes-candidatures", label: "Mes candidatures", icon: FileCheck },
        ]
      : []),
    { href: "/mes-interventions", label: "Mes interventions", icon: CalendarCheck },
    { href: "/covoiturage", label: "Covoiturage", icon: Car },
    { href: "/mes-trajets", label: "Mes trajets", icon: Car },
    { href: "/mes-reservations", label: "Mes réservations", icon: Ticket },
    { href: "/profil/paiements", label: "Paiements", icon: CreditCard },
    { href: "/profil/modifier", label: "Modifier mon profil", icon: Pencil },
    { href: "/profil/donnees", label: "Mes données", icon: ShieldCheck },
    { href: "/mes-services", label: "Mes services", icon: Wrench },
    { href: "/mes-demandes", label: "Mes demandes", icon: ClipboardList },
    { href: "/favoris", label: "Mes favoris", icon: Heart },
  ];

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-4 py-8">
      <div className="flex items-center gap-4">
        <Avatar
          firstName={profile.first_name}
          lastName={profile.last_name}
          photoUrl={profile.avatar_url}
          size="lg"
        />
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
          <dt className="text-brand-ink/70">Téléphone</dt>
          {/* La mention "(non vérifié)" est retirée : aucune procédure de
              vérification n'existe, donc elle ne pouvait jamais disparaître.
              Elle laissait croire à un contrôle que personne ne pouvait
              passer. Elle reviendra avec la vérification par SMS. */}
          <dd className="font-medium text-brand-ink">{profile.phone || "—"}</dd>
        </div>
        {user?.email ? (
          <div className="flex justify-between">
            <dt className="text-brand-ink/70">E-mail</dt>
            <dd className="font-medium text-brand-ink">{user.email}</dd>
          </div>
        ) : null}
        <div className="flex justify-between">
          <dt className="text-brand-ink/70">Zone d&rsquo;intervention</dt>
          <dd className="font-medium text-brand-ink">
            {profile.service_area || "—"}
          </dd>
        </div>
      </dl>

      {awaitingValidation.length > 0 ? (
        <Link
          href="/mes-interventions?vue=attente"
          className="flex flex-col gap-1 rounded-xl bg-brand-gold/15 p-4"
        >
          <p className="text-sm font-semibold text-brand-green-dark">
            {awaitingValidation.length} intervention
            {awaitingValidation.length > 1 ? "s" : ""} en attente de votre validation
          </p>
          <p className="text-xs text-brand-ink/70">Voir dans Mes interventions →</p>
        </Link>
      ) : null}

      <nav className="flex flex-col overflow-hidden rounded-xl bg-white shadow-sm shadow-black/5">
        {menuItems.map(({ href, label, icon: Icon, badge }, i) => (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-3 px-4 py-3.5 text-sm font-medium text-brand-ink ${
              i > 0 ? "border-t border-brand-ink/8" : ""
            }`}
          >
            <Icon className="h-5 w-5 text-brand-green-dark" aria-hidden="true" />
            <span className="flex-1">{label}</span>
            {badge ? (
              <span className="rounded-full bg-red-500 px-2 py-0.5 text-xs font-semibold text-white">
                {badge > 9 ? "9+" : badge}
              </span>
            ) : null}
            <ChevronRight className="h-4 w-4 text-brand-ink/30" aria-hidden="true" />
          </Link>
        ))}
      </nav>

      <SignOutButton />

      <p className="text-center text-xs text-brand-ink/65">
        Membre depuis le{" "}
        {new Date(profile.created_at).toLocaleDateString("fr-FR")}
      </p>

      <Link href="/" className="text-center text-sm text-brand-green-dark">
        Retour à l&rsquo;accueil
      </Link>
    </div>
  );
}
