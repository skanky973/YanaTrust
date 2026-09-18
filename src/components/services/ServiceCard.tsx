import Link from "next/link";
import { getCategoryLabel } from "@/lib/services/categories";
import type { ServiceWithProvider } from "@/lib/services/queries";

function initials(firstName: string, lastName: string) {
  return `${firstName[0] ?? ""}${lastName[0] ?? ""}`.toUpperCase() || "?";
}

export function ServiceCard({
  service,
  coverPhotoUrl,
}: {
  service: ServiceWithProvider;
  coverPhotoUrl?: string;
}) {
  return (
    <Link
      href={`/services/${service.id}`}
      className="flex gap-3 rounded-xl bg-white shadow-sm shadow-black/5 p-4"
    >
      {coverPhotoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={coverPhotoUrl}
          alt=""
          className="h-16 w-16 shrink-0 rounded-lg object-cover"
        />
      ) : (
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-brand-green/10 text-lg font-bold text-brand-green-dark">
          {service.provider
            ? initials(service.provider.first_name, service.provider.last_name)
            : "?"}
        </div>
      )}
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-start justify-between gap-3">
          <h2 className="font-semibold text-brand-ink">{service.title}</h2>
          {service.price_from !== null ? (
            <span className="shrink-0 rounded-full bg-brand-green/10 px-2 py-0.5 text-xs font-semibold text-brand-green-dark">
              dès {service.price_from} €
            </span>
          ) : null}
        </div>
        <p className="text-xs text-brand-ink/70">
          {getCategoryLabel(service.category)}
          {service.city ? ` · ${service.city}` : ""}
        </p>
        <p className="line-clamp-2 text-sm text-brand-ink/70">
          {service.description}
        </p>
        {service.provider ? (
          <p className="text-xs text-brand-ink/65">
            Par {service.provider.first_name} {service.provider.last_name}
          </p>
        ) : null}
      </div>
    </Link>
  );
}
