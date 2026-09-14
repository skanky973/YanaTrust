import Link from "next/link";
import { DeleteRequestButton } from "@/components/requests/DeleteRequestButton";
import { getCategoryLabel } from "@/lib/services/categories";
import { getStatusLabel } from "@/lib/requests/status";
import type { ServiceRequest } from "@/lib/supabase/database.types";

const STATUS_STYLES: Record<string, string> = {
  open: "bg-brand-green/15 text-brand-green-dark",
  in_discussion: "bg-brand-gold/25 text-brand-green-dark",
  completed: "bg-brand-ink/10 text-brand-ink/60",
  cancelled: "bg-red-50 text-red-500",
};

export function MyRequestCard({ request }: { request: ServiceRequest }) {
  return (
    <div className="flex flex-col gap-3 rounded-xl bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-semibold text-brand-ink">{request.title}</h2>
          <p className="text-sm text-brand-ink/60">
            {getCategoryLabel(request.category)}
          </p>
        </div>
        <span
          className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${
            STATUS_STYLES[request.status] ?? "bg-brand-ink/10 text-brand-ink/60"
          }`}
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
