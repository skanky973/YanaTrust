import Link from "next/link";
import { archiveService, unarchiveService } from "@/app/mes-services/actions";
import { DeleteServiceButton } from "@/components/services/DeleteServiceButton";
import { getCategoryLabel } from "@/lib/services/categories";
import type { Service } from "@/lib/supabase/database.types";

export function MyServiceCard({ service }: { service: Service }) {
  const isActive = service.status === "active";

  return (
    <div className="flex flex-col gap-3 rounded-xl bg-white shadow-sm shadow-black/5 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-semibold text-brand-ink">{service.title}</h2>
          <p className="text-sm text-brand-ink/70">
            {getCategoryLabel(service.category)}
          </p>
        </div>
        <span
          className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${
            isActive
              ? "bg-brand-green/15 text-brand-green-dark"
              : "bg-brand-ink/10 text-brand-ink/70"
          }`}
        >
          {isActive ? "Actif" : "Archivé"}
        </span>
      </div>

      <div className="flex flex-wrap gap-2 text-sm">
        <Link
          href={`/mes-services/${service.id}`}
          className="rounded-lg bg-brand-green-dark/10 px-3 py-1.5 font-medium text-brand-green-dark"
        >
          Modifier
        </Link>

        <form action={archiveService.bind(null, service.id)}>
          {isActive ? (
            <button
              type="submit"
              className="rounded-lg bg-brand-gold/20 px-3 py-1.5 font-medium text-brand-ink"
            >
              Archiver
            </button>
          ) : null}
        </form>

        <form action={unarchiveService.bind(null, service.id)}>
          {!isActive ? (
            <button
              type="submit"
              className="rounded-lg bg-brand-green/15 px-3 py-1.5 font-medium text-brand-green-dark"
            >
              Réactiver
            </button>
          ) : null}
        </form>

        <DeleteServiceButton serviceId={service.id} />
      </div>
    </div>
  );
}
