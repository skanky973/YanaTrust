import Link from "next/link";
import { acceptApplication, refuseApplication } from "@/lib/actions/applications";
import { getApplicationStatusLabel, getApplicationStatusColor } from "@/lib/applications/status";
import type { ApplicationWithProvider } from "@/lib/applications/queries";

export function ApplicationCard({ application }: { application: ApplicationWithProvider }) {
  const provider = application.provider;

  return (
    <div className="flex flex-col gap-3 rounded-xl bg-white shadow-sm shadow-black/5 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          {provider ? (
            <Link
              href={`/prestataires/${provider.id}`}
              className="font-semibold text-brand-ink hover:underline"
            >
              {provider.first_name} {provider.last_name}
            </Link>
          ) : (
            <span className="font-semibold text-brand-ink">Prestataire</span>
          )}
          {provider?.identity_verified ? (
            <span className="ml-2 text-xs font-medium text-brand-green-dark">
              Identité vérifiée
            </span>
          ) : null}
        </div>
        <span
          className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${getApplicationStatusColor(application.status)}`}
        >
          {getApplicationStatusLabel(application.status)}
        </span>
      </div>

      <p className="text-sm text-brand-ink/70">{application.message}</p>

      <div className="flex flex-wrap gap-3 text-xs text-brand-ink/60">
        {application.proposed_price !== null ? (
          <span>Prix proposé : {application.proposed_price} €</span>
        ) : null}
        {application.estimated_duration_minutes !== null ? (
          <span>Durée estimée : {application.estimated_duration_minutes} min</span>
        ) : null}
      </div>

      {application.status === "pending" ? (
        <div className="flex gap-2">
          <form action={acceptApplication.bind(null, application.id)}>
            <button
              type="submit"
              className="rounded-lg bg-brand-green-dark px-3 py-1.5 text-sm font-medium text-brand-cream"
            >
              Accepter et discuter
            </button>
          </form>
          <form action={refuseApplication.bind(null, application.id)}>
            <button
              type="submit"
              className="rounded-lg bg-red-50 px-3 py-1.5 text-sm font-medium text-red-600"
            >
              Refuser
            </button>
          </form>
        </div>
      ) : null}

      {application.status === "accepted_for_discussion" && application.conversation_id ? (
        <Link
          href={`/messages/${application.conversation_id}`}
          className="rounded-lg bg-brand-green/10 px-3 py-1.5 text-center text-sm font-medium text-brand-green-dark"
        >
          Voir la conversation
        </Link>
      ) : null}
    </div>
  );
}
