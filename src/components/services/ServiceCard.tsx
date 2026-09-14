import Link from "next/link";
import { getCategoryLabel } from "@/lib/services/categories";
import type { ServiceWithProvider } from "@/lib/services/queries";

export function ServiceCard({ service }: { service: ServiceWithProvider }) {
  return (
    <Link
      href={`/services/${service.id}`}
      className="flex flex-col gap-1 rounded-xl bg-white p-4"
    >
      <div className="flex items-start justify-between gap-3">
        <h2 className="font-semibold text-brand-ink">{service.title}</h2>
        {service.price_from !== null ? (
          <span className="shrink-0 text-sm font-semibold text-brand-green-dark">
            dès {service.price_from} €
          </span>
        ) : null}
      </div>
      <p className="text-xs text-brand-ink/60">
        {getCategoryLabel(service.category)}
        {service.city ? ` · ${service.city}` : ""}
      </p>
      <p className="mt-1 line-clamp-2 text-sm text-brand-ink/70">
        {service.description}
      </p>
      {service.provider ? (
        <p className="mt-1 text-xs text-brand-ink/50">
          Par {service.provider.first_name} {service.provider.last_name}
        </p>
      ) : null}
    </Link>
  );
}
