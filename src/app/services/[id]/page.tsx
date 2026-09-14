import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getServiceById, getServicePhotos } from "@/lib/services/queries";
import { getCategoryLabel } from "@/lib/services/categories";
import { createClient } from "@/lib/supabase/server";
import { startConversationWithUser } from "@/lib/actions/conversations";
import { Button } from "@/components/ui/Button";
import { getProviderRatingSummary, getProviderReviews } from "@/lib/reviews/queries";
import { RatingBadge } from "@/components/reviews/RatingBadge";
import { ReviewList } from "@/components/reviews/ReviewList";
import { FavoriteServiceButton } from "@/components/favorites/FavoriteServiceButton";
import { ReportButton } from "@/components/reports/ReportButton";

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
  const [ratingSummary, reviews, photos] = await Promise.all([
    getProviderRatingSummary(service.provider_id),
    getProviderReviews(service.provider_id),
    getServicePhotos(service.id),
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
        <div className="flex justify-between">
          <dt className="text-brand-ink/60">Prestataire</dt>
          <dd className="font-medium text-brand-ink">
            <Link
              href={`/prestataires/${service.provider_id}`}
              className="text-brand-green-dark underline"
            >
              {service.provider
                ? `${service.provider.first_name} ${service.provider.last_name}`
                : "—"}
            </Link>
          </dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-brand-ink/60">Note</dt>
          <dd>
            <RatingBadge summary={ratingSummary} />
          </dd>
        </div>
      </dl>

      {canContact ? (
        <form action={startConversationWithUser.bind(null, service.provider_id)}>
          <Button type="submit" variant="primary" className="w-full">
            Contacter ce prestataire
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
