import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProfileById } from "@/lib/profiles/queries";
import { getActiveServicesByProvider } from "@/lib/services/queries";
import { getProviderRatingSummary, getProviderReviews } from "@/lib/reviews/queries";
import { createClient } from "@/lib/supabase/server";
import { startConversationWithUser } from "@/lib/actions/conversations";
import { Button } from "@/components/ui/Button";
import { RatingBadge } from "@/components/reviews/RatingBadge";
import { ReviewList } from "@/components/reviews/ReviewList";
import { FavoriteProviderButton } from "@/components/favorites/FavoriteProviderButton";
import { ReportButton } from "@/components/reports/ReportButton";
import { ServiceCard } from "@/components/services/ServiceCard";

function initials(firstName: string, lastName: string) {
  return `${firstName[0] ?? ""}${lastName[0] ?? ""}`.toUpperCase() || "?";
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const profile = await getProfileById(id);
  return {
    title: profile
      ? `${profile.first_name} ${profile.last_name} — YanaTrust`
      : "Prestataire — YanaTrust",
  };
}

export default async function PrestatairePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const profile = await getProfileById(id);

  if (!profile || !profile.is_provider) {
    notFound();
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const canContact = !!user && user.id !== profile.id;

  const [ratingSummary, reviews, services] = await Promise.all([
    getProviderRatingSummary(profile.id),
    getProviderReviews(profile.id),
    getActiveServicesByProvider(profile.id),
  ]);

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
          <RatingBadge summary={ratingSummary} />
        </div>
      </div>

      {profile.bio ? (
        <p className="rounded-xl bg-white shadow-sm shadow-black/5 p-4 text-sm text-brand-ink/80">
          {profile.bio}
        </p>
      ) : null}

      {profile.service_area ? (
        <dl className="rounded-xl bg-white shadow-sm shadow-black/5 p-4 text-sm">
          <div className="flex justify-between">
            <dt className="text-brand-ink/60">Zone d&rsquo;intervention</dt>
            <dd className="font-medium text-brand-ink">
              {profile.service_area}
            </dd>
          </div>
        </dl>
      ) : null}

      {canContact ? (
        <form action={startConversationWithUser.bind(null, profile.id)}>
          <Button type="submit" variant="primary" className="w-full">
            Contacter ce prestataire
          </Button>
        </form>
      ) : !user ? (
        <Link
          href={`/connexion?suivant=/prestataires/${profile.id}`}
          className="text-center text-sm font-semibold text-brand-green-dark"
        >
          Se connecter pour contacter ce prestataire
        </Link>
      ) : null}

      <FavoriteProviderButton providerId={profile.id} />

      {services.length > 0 ? (
        <div>
          <h2 className="mb-3 text-lg font-semibold text-brand-ink">
            Services proposés
          </h2>
          <div className="flex flex-col gap-3">
            {services.map((service) => (
              <ServiceCard
                key={service.id}
                service={{ ...service, provider: profile }}
              />
            ))}
          </div>
        </div>
      ) : null}

      <div>
        <h2 className="mb-3 text-lg font-semibold text-brand-ink">Avis</h2>
        <ReviewList reviews={reviews} />
      </div>

      <div className="flex justify-center">
        <ReportButton
          targetType="profile"
          targetId={profile.id}
          label="Signaler ce prestataire"
        />
      </div>
    </div>
  );
}
