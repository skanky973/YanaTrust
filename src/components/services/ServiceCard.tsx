import Link from "next/link";
import { getCategoryLabel } from "@/lib/services/categories";
import { CATEGORY_ICONS } from "@/lib/services/category-icons";
import { formatCity } from "@/lib/format/city";
import { Avatar } from "@/components/ui/Avatar";
import type { ServiceCategory } from "@/lib/services/categories";
import type { ServiceWithProvider } from "@/lib/services/queries";

export function ServiceCard({
  service,
  coverPhotoUrl,
}: {
  service: ServiceWithProvider;
  coverPhotoUrl?: string;
}) {
  // À défaut de photo, l'icône de la catégorie dit de quel service il s'agit.
  // Les initiales du prestataire qui s'affichaient ici ne renseignaient sur
  // rien : ni sur le service, ni sur une personne qu'on saurait reconnaître.
  const Icon = CATEGORY_ICONS[service.category as ServiceCategory];

  return (
    <Link
      href={`/services/${service.id}`}
      className="flex gap-3 rounded-2xl bg-white p-4 shadow-sm shadow-black/5"
    >
      {coverPhotoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={coverPhotoUrl}
          alt=""
          className="h-16 w-16 shrink-0 rounded-xl object-cover"
        />
      ) : (
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-brand-green/10 text-brand-green-dark">
          {Icon ? <Icon className="h-7 w-7" aria-hidden="true" /> : null}
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
          {service.city ? ` · ${formatCity(service.city)}` : ""}
        </p>

        <p className="line-clamp-2 text-sm text-brand-ink/70">
          {service.description}
        </p>

        {service.provider ? (
          <div className="mt-1 flex items-center gap-2">
            <Avatar
              firstName={service.provider.first_name}
              lastName={service.provider.last_name}
              photoUrl={service.provider.avatar_url}
              size="xs"
            />
            <p className="truncate text-xs text-brand-ink/70">
              {service.provider.first_name} {service.provider.last_name}
            </p>
          </div>
        ) : null}
      </div>
    </Link>
  );
}
