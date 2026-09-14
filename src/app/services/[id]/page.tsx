import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BadgeCheck } from "lucide-react";
import { getServiceById, getServicePhotos } from "@/lib/services/queries";
import { getCategoryLabel } from "@/lib/services/categories";
import { getProfileById } from "@/lib/profiles/queries";
import { createClient } from "@/lib/supabase/server";
import { startConversationWithUser } from "@/lib/actions/conversations";
import { Button } from "@/components/ui/Button";
import { getProviderRatingSummary, getProviderReviews } from "@/lib/reviews/queries";
import { getProviderTrustScore } from "@/lib/trust/queries";
import { RatingBadge } from "@/components/reviews/RatingBadge";
import { ReviewList } from "@/components/reviews/ReviewList";
import { FavoriteServiceButton } from "@/components/favorites/FavoriteServiceButton";
import { ReportButton } from "@/components/reports/ReportButton";
import { TrustScoreBadge } from "@/components/trust/TrustScoreBadge";

function initials(firstName: string, lastName: string) {
  return `${firstName[0] ?? ""}${lastName[0] ?? ""}`.toUpperCase() || "?";
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const service = await getServiceById(id);
  return { title: service ? `${service.title} — YanaTrust` : "Service — YanaTrust" };
}

export default async function ServicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const service = await getServiceById(id);

  if (!service || service.status !== "active") {
    notFound();
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const canContact = !!user && user.id !== service.provider_id;
  const [ratingSummary, reviews, photos, providerProfile, trustScore] =
    await Promise.all([
      getProviderRatingSummary(service.provider_id),
      getProviderReviews(service.provider_id),
      getServicePhotos(service.id),
      getProfileById(service.provider_id),
      getProviderTrustScore(service.provider_id),
    ]);

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-4 py-8">
      {photos.length > 0 ? (
        <div className="grid grid-cols-2 gap-2">
          {photos.map((photo) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={photo.id}
              src={photo.url}
              alt={service.title}
              className="aspect-square w-full rounded-xl object-cover"
            />
          ))}
        </div>
      ) : null}

      <div>
        <span className="rounded-full bg-brand-gold/25 px-2 py-0.5 text-xs font-semibold text-brand-green-dark">
          {getCategoryLabel(service.category)}
        </span>
        <h1 className="mt-2 text-2xl font-bold text-brand-ink">
          {service.title}
        </h1>
        {service.price_from !== null ? (
          <p className="mt-1 text-brand-green-dark font-semibold">
            À partir de {service.price_from} €
          </p>
        ) : null}
      </div>

      <Link
        href={`/prestataires/${service.provider_id}`}
        className="flex items-center gap-3 rounded-xl bg-white shadow-sm shadow-black/5 p-4"
      >
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-green-dark text-sm font-bold text-brand-cream">
          {providerProfile
            ? initials(providerProfile.first_name, providerProfile.last_name)
            : "?"}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <p className="truncate font-semibold text-brand-ink">
              {service.provider
                ? `${service.provider.first_name} ${service.provider.last_name}`
                : "—"}
            </p>
            {providerProfile?.identity_verified ? (
              <BadgeCheck
                className="h-4 w-4 shrink-0 text-brand-green"
                aria-label="Identité vérifiée"
              />
            ) : null}
          </div>
          <RatingBadge summary={ratingSummary} />
        </div>
      </Link>

      <TrustScoreBadge score={trustScore} size="sm" />

      <p className="whitespace-pre-line rounded-xl bg-white shadow-sm shadow-black/5 p-4 text-sm text-brand-ink/80">
        {service.description}
      </p>

      <dl className="grid gap-3 rounded-xl bg-white shadow-sm shadow-black/5 p-4 text-sm">
        <div className="flex justify-between">
          <dt className="text-brand-ink/60">Ville</dt>
          <dd className="font-medium text-brand-ink">
            {service.city || "—"}
          </dd>
        </div>
        {service.service_area ? (
          <div className="flex justify-between">
            <dt className="text-brand-ink/60">Zone d&rsquo;intervention</dt>
            <dd className="font-medium text-brand-ink">
              {service.service_area}
            </dd>
          </div>
        ) : null}
      </dl>

      {canContact ? (
        <form action={startConversationWithUser.bind(null, service.provider_id)}>
          <Button type="submit" variant="primary" className="w-full">
            Demander ce service
          </Button>
        </form>
      ) : !user ? (
        <Link
          href={`/connexion?suivant=/services/${service.id}`}
          className="text-center text-sm font-semibold text-brand-green-dark"
        >
          Se connecter pour contacter ce prestataire
        </Link>
      ) : null}

      <FavoriteServiceButton serviceId={service.id} />

      <div>
        <h2 className="mb-3 text-lg font-semibold text-brand-ink">
          Avis sur ce prestataire
        </h2>
        <ReviewList reviews={reviews} />
      </div>

      <div className="flex justify-center gap-4">
        <ReportButton
          targetType="service"
          targetId={service.id}
          label="Signaler ce service"
        />
        <ReportButton
          targetType="profile"
          targetId={service.provider_id}
          label="Signaler ce prestataire"
        />
      </div>

      <Link
        href="/recherche"
        className="text-center text-sm text-brand-green-dark"
      >
        ← Retour à la recherche
      </Link>
    </div>
  );
}
