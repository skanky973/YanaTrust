import Link from "next/link";
import { Clock, MapPin } from "lucide-react";
import { StatusBadge } from "@/components/interventions/StatusBadge";
import { getCategoryLabel } from "@/lib/services/categories";
import type { InterventionWithParties } from "@/lib/interventions/queries";

function formatDate(dateStr: string) {
  return new Date(`${dateStr}T00:00:00`).toLocaleDateString("fr-FR", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

export function InterventionCard({
  intervention,
  viewerRole = "provider",
}: {
  intervention: InterventionWithParties;
  viewerRole?: "provider" | "client";
}) {
  const otherParty =
    viewerRole === "provider" ? intervention.client : intervention.provider;

  return (
    <Link
      href={`/planning/${intervention.id}`}
      className="flex flex-col gap-2 rounded-xl bg-white shadow-sm shadow-black/5 p-4"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate font-semibold text-brand-ink">
            {intervention.title}
          </h3>
          <p className="text-xs text-brand-ink/60">
            {getCategoryLabel(intervention.category)}
            {otherParty ? ` · ${otherParty.first_name} ${otherParty.last_name}` : ""}
          </p>
        </div>
        <StatusBadge status={intervention.status} />
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-brand-ink/60">
        <span className="flex items-center gap-1">
          <Clock className="h-3.5 w-3.5" aria-hidden="true" />
          {formatDate(intervention.scheduled_date)} · {intervention.start_time.slice(0, 5)}
        </span>
        {intervention.address ? (
          <span className="flex items-center gap-1 truncate">
            <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span className="truncate">{intervention.address}</span>
          </span>
        ) : null}
      </div>
    </Link>
  );
}
