import Link from "next/link";
import { getCategoryLabel } from "@/lib/services/categories";
import type { RequestWithClient } from "@/lib/requests/queries";

export function RequestCard({ request }: { request: RequestWithClient }) {
  return (
    <Link
      href={`/demandes/${request.id}`}
      className="flex flex-col gap-1 rounded-xl bg-white shadow-sm shadow-black/5 p-4"
    >
      <div className="flex items-start justify-between gap-3">
        <h2 className="font-semibold text-brand-ink">{request.title}</h2>
        {request.budget !== null ? (
          <span className="shrink-0 rounded-full bg-brand-green/10 px-2 py-0.5 text-xs font-semibold text-brand-green-dark">
            jusqu&rsquo;à {request.budget} €
          </span>
        ) : null}
      </div>
      <p className="text-xs text-brand-ink/60">
        {getCategoryLabel(request.category)}
        {request.city ? ` · ${request.city}` : ""}
      </p>
      <p className="line-clamp-2 text-sm text-brand-ink/70">{request.description}</p>
    </Link>
  );
}
