import Link from "next/link";
import { DeleteRequestButton } from "@/components/requests/DeleteRequestButton";
import { getCategoryLabel } from "@/lib/services/categories";
import { getStatusLabel, getStatusColor } from "@/lib/requests/status";
import type { ServiceRequest } from "@/lib/supabase/database.types";

export function MyRequestCard({ request }: { request: ServiceRequest }) {
  return (
    <div className="flex flex-col gap-3 rounded-xl bg-white shadow-sm shadow-black/5 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-semibold text-brand-ink">{request.title}</h2>
          <p className="text-sm text-brand-ink/60">
            {getCategoryLabel(request.category)}
          </p>
        </div>
        <span
          className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${getStatusColor(request.status)}`}
        >
          {getStatusLabel(request.status)}
        </span>
      </div>

      <div className="flex flex-wrap gap-2 text-sm">
        <Link
          href={`/mes-demandes/${request.id}`}
          className="rounded-lg bg-brand-green-dark/10 px-3 py-1.5 font-medium text-brand-green-dark"
        >
          Modifier
        </Link>
        <DeleteRequestButton requestId={request.id} />
      </div>
    </div>
  );
}
