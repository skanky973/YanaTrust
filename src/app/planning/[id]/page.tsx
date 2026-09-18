import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { MapPin, Phone, Clock } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import {
  getInterventionById,
  getInterventionPhotoUrls,
} from "@/lib/interventions/queries";
import { getCategoryLabel } from "@/lib/services/categories";
import { StatusBadge } from "@/components/interventions/StatusBadge";
import { ProviderActionButtons } from "@/components/interventions/ProviderActionButtons";
import { ClientValidationForm } from "@/components/interventions/ClientValidationForm";

export const metadata: Metadata = {
  title: "Intervention — YanaTrust",
};

function formatDate(dateStr: string) {
  return new Date(`${dateStr}T00:00:00`).toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default async function InterventionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/connexion?suivant=/planning/${id}`);
  }

  const intervention = await getInterventionById(id);

  if (!intervention) {
    notFound();
  }

  const isProvider = intervention.provider_id === user.id;
  const photos = await getInterventionPhotoUrls(id);
  const beforePhotos = photos.filter((p) => p.type === "before");
  const afterPhotos = photos.filter((p) => p.type === "after");

  const otherParty = isProvider ? intervention.client : intervention.provider;

  const mapsHref = intervention.address
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(intervention.address)}`
    : null;

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-4 py-8">
      <div>
        <span className="rounded-full bg-brand-gold/25 px-2 py-0.5 text-xs font-semibold text-brand-green-dark">
          {getCategoryLabel(intervention.category)}
        </span>
        <div className="mt-2 flex items-start justify-between gap-3">
          <h1 className="text-2xl font-bold text-brand-ink">{intervention.title}</h1>
          <StatusBadge status={intervention.status} />
        </div>
      </div>

      <dl className="grid gap-3 rounded-xl bg-white shadow-sm shadow-black/5 p-4 text-sm">
        <div className="flex justify-between">
          <dt className="text-brand-ink/70">
            {isProvider ? "Client" : "Prestataire"}
          </dt>
          <dd className="font-medium text-brand-ink">
            {otherParty ? `${otherParty.first_name} ${otherParty.last_name}` : "—"}
          </dd>
        </div>
        {isProvider && intervention.client_phone ? (
          <div className="flex justify-between">
            <dt className="flex items-center gap-1 text-brand-ink/70">
              <Phone className="h-3.5 w-3.5" aria-hidden="true" /> Téléphone
            </dt>
            <dd className="font-medium text-brand-ink">{intervention.client_phone}</dd>
          </div>
        ) : null}
        <div className="flex justify-between">
          <dt className="flex items-center gap-1 text-brand-ink/70">
            <Clock className="h-3.5 w-3.5" aria-hidden="true" /> Date
          </dt>
          <dd className="font-medium text-brand-ink">
            {formatDate(intervention.scheduled_date)}
          </dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-brand-ink/70">Heure de début</dt>
          <dd className="font-medium text-brand-ink">
            {intervention.start_time.slice(0, 5)} ({intervention.duration_minutes} min)
          </dd>
        </div>
        {intervention.address ? (
          <div className="flex justify-between gap-3">
            <dt className="flex items-center gap-1 text-brand-ink/70">
              <MapPin className="h-3.5 w-3.5" aria-hidden="true" /> Adresse
            </dt>
            <dd className="text-right font-medium text-brand-ink">
              {intervention.address}
              {mapsHref ? (
                <>
                  {" "}
                  <a
                    href={mapsHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brand-green-dark underline"
                  >
                    Itinéraire
                  </a>
                </>
              ) : null}
            </dd>
          </div>
        ) : null}
        {intervention.price !== null ? (
          <div className="flex justify-between">
            <dt className="text-brand-ink/70">Prix convenu</dt>
            <dd className="font-medium text-brand-ink">{intervention.price} €</dd>
          </div>
        ) : null}
        {intervention.final_price !== null ? (
          <div className="flex justify-between">
            <dt className="text-brand-ink/70">Montant final</dt>
            <dd className="font-medium text-brand-ink">{intervention.final_price} €</dd>
          </div>
        ) : null}
      </dl>

      {intervention.description ? (
        <div>
          <h2 className="mb-2 text-sm font-semibold text-brand-ink/70">Description</h2>
          <p className="whitespace-pre-line rounded-xl bg-white shadow-sm shadow-black/5 p-4 text-sm text-brand-ink/80">
            {intervention.description}
          </p>
        </div>
      ) : null}

      {isProvider && intervention.provider_note ? (
        <div>
          <h2 className="mb-2 text-sm font-semibold text-brand-ink/70">
            Note privée
          </h2>
          <p className="whitespace-pre-line rounded-xl bg-brand-gold/10 p-4 text-sm text-brand-ink/80">
            {intervention.provider_note}
          </p>
        </div>
      ) : null}

      {intervention.status === "completed" || intervention.status === "validated" ? (
        <div className="rounded-xl bg-white shadow-sm shadow-black/5 p-4">
          <h2 className="mb-2 text-sm font-semibold text-brand-ink/70">
            Compte-rendu
          </h2>
          {intervention.work_notes ? (
            <p className="whitespace-pre-line text-sm text-brand-ink/80">
              {intervention.work_notes}
            </p>
          ) : null}
          {intervention.materials_used ? (
            <p className="mt-2 text-xs text-brand-ink/70">
              Matériel : {intervention.materials_used}
            </p>
          ) : null}
          {intervention.needs_followup ? (
            <p className="mt-2 text-xs font-semibold text-brand-gold">
              Une autre intervention est nécessaire
            </p>
          ) : null}
        </div>
      ) : null}

      {beforePhotos.length > 0 || afterPhotos.length > 0 ? (
        <div className="flex flex-col gap-3">
          {beforePhotos.length > 0 ? (
            <div>
              <h2 className="mb-2 text-sm font-semibold text-brand-ink/70">Avant</h2>
              <div className="grid grid-cols-3 gap-2">
                {beforePhotos.map((p) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={p.id} src={p.url} alt="" className="aspect-square w-full rounded-lg object-cover" />
                ))}
              </div>
            </div>
          ) : null}
          {afterPhotos.length > 0 ? (
            <div>
              <h2 className="mb-2 text-sm font-semibold text-brand-ink/70">Après</h2>
              <div className="grid grid-cols-3 gap-2">
                {afterPhotos.map((p) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={p.id} src={p.url} alt="" className="aspect-square w-full rounded-lg object-cover" />
                ))}
              </div>
            </div>
          ) : null}
        </div>
      ) : null}

      {intervention.client_comment ? (
        <div
          className={`rounded-xl p-4 text-sm ${
            intervention.client_reported_problem
              ? "bg-red-50 text-red-700"
              : "bg-brand-green/10 text-brand-green-dark"
          }`}
        >
          <p className="font-semibold">
            {intervention.client_reported_problem
              ? "Problème signalé par le client"
              : "Commentaire du client"}
          </p>
          <p className="mt-1">{intervention.client_comment}</p>
          {intervention.client_rating ? (
            <p className="mt-1 font-semibold">Note : {intervention.client_rating}/5</p>
          ) : null}
        </div>
      ) : null}

      {isProvider ? (
        <ProviderActionButtons interventionId={intervention.id} status={intervention.status} />
      ) : intervention.status === "completed" ? (
        <div>
          <p className="mb-3 text-sm text-brand-ink/70">
            Le prestataire a terminé cette intervention et attend votre validation.
          </p>
          <ClientValidationForm interventionId={intervention.id} />
        </div>
      ) : null}

      <Link href="/planning" className="text-center text-sm text-brand-green-dark">
        ← Retour au planning
      </Link>
    </div>
  );
}
