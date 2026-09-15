import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getRequestById, getRequestPhotoUrls } from "@/lib/requests/queries";
import { getApplicationsForRequest, getMyApplication } from "@/lib/applications/queries";
import { getStatusLabel, getStatusColor } from "@/lib/requests/status";
import { getCategoryLabel } from "@/lib/services/categories";
import { ApplicationForm } from "@/components/requests/ApplicationForm";
import { ApplicationCard } from "@/components/requests/ApplicationCard";

export const metadata: Metadata = {
  title: "Demande — YanaTrust",
};

export default async function DemandeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const request = await getRequestById(id);

  if (!request) {
    notFound();
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [photos, applications, myApplication] = await Promise.all([
    getRequestPhotoUrls(id),
    user && user.id === request.client_id ? getApplicationsForRequest(id) : Promise.resolve([]),
    user && user.id !== request.client_id ? getMyApplication(id) : Promise.resolve(null),
  ]);

  const isOwner = user?.id === request.client_id;
  const isProvider = !!user && !isOwner;

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-4 py-8">
      <div className="flex flex-col gap-2 rounded-xl bg-white shadow-sm shadow-black/5 p-4">
        <div className="flex items-start justify-between gap-3">
          <h1 className="text-xl font-bold text-brand-ink">{request.title}</h1>
          <span
            className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${getStatusColor(request.status)}`}
          >
            {getStatusLabel(request.status)}
          </span>
        </div>
        <p className="text-sm text-brand-ink/60">
          {getCategoryLabel(request.category)}
          {request.city ? ` · ${request.city}` : ""}
        </p>
        {request.budget !== null ? (
          <p className="text-sm font-semibold text-brand-green-dark">
            Budget indicatif : jusqu&rsquo;à {request.budget} €
          </p>
        ) : null}
        {request.desired_date ? (
          <p className="text-sm text-brand-ink/60">
            Date souhaitée : {new Date(request.desired_date).toLocaleDateString("fr-FR")}
          </p>
        ) : null}
        <p className="text-sm text-brand-ink/80">{request.description}</p>
        {request.client ? (
          <p className="text-xs text-brand-ink/50">
            Publiée par {request.client.first_name} {request.client.last_name}
          </p>
        ) : null}
      </div>

      {photos.length > 0 ? (
        <div className="grid grid-cols-2 gap-2">
          {photos.map((photo) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={photo.id}
              src={photo.url}
              alt=""
              className="aspect-square w-full rounded-xl object-cover"
            />
          ))}
        </div>
      ) : null}

      {isProvider && request.status === "open" ? (
        <ApplicationForm requestId={id} existingApplication={myApplication} />
      ) : null}

      {isProvider && request.status !== "open" && myApplication ? (
        <p className="rounded-xl bg-white shadow-sm shadow-black/5 p-4 text-sm text-brand-ink/60">
          Cette demande n&rsquo;est plus ouverte aux candidatures.
        </p>
      ) : null}

      {isOwner ? (
        <div className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold text-brand-ink">
            Candidatures ({applications.length})
          </h2>
          {applications.length === 0 ? (
            <p className="rounded-xl bg-white shadow-sm shadow-black/5 p-4 text-sm text-brand-ink/60">
              Aucune candidature pour le moment.
            </p>
          ) : (
            applications.map((application) => (
              <ApplicationCard key={application.id} application={application} />
            ))
          )}
        </div>
      ) : null}
    </div>
  );
}
