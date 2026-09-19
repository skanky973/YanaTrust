import Link from "next/link";
import { formatCity } from "@/lib/format/city";
import { Avatar } from "@/components/ui/Avatar";
import type { TripWithDriver } from "@/lib/carpool/queries";

function formatDate(dateStr: string) {
  return new Date(`${dateStr}T00:00:00`).toLocaleDateString("fr-FR", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

export function TripCard({ trip }: { trip: TripWithDriver }) {
  const complet = trip.seats_available === 0;

  return (
    <Link
      href={`/covoiturage/${trip.id}`}
      className="flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-sm shadow-black/5"
    >
      <div className="flex items-start justify-between gap-3">
        {/* Départ et arrivée empilés le long d'un trait : sur un écran étroit,
            deux villes longues séparées par une flèche débordent vite. */}
        <div className="flex min-w-0 flex-1 gap-3">
          <div className="flex flex-col items-center pt-1.5" aria-hidden="true">
            <span className="h-2.5 w-2.5 rounded-full border-2 border-brand-green" />
            <span className="my-1 w-px flex-1 bg-brand-ink/15" />
            <span className="h-2.5 w-2.5 rounded-full bg-brand-green-dark" />
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <p className="truncate font-semibold leading-none text-brand-ink">
              {formatCity(trip.origin_city)}
            </p>
            <p className="truncate font-semibold leading-none text-brand-ink">
              {formatCity(trip.destination_city)}
            </p>
          </div>
        </div>

        <span className="shrink-0 rounded-full bg-brand-green/10 px-2.5 py-1 text-xs font-semibold text-brand-green-dark">
          {trip.price_per_seat} € <span className="font-medium">/ place</span>
        </span>
      </div>

      <div className="flex items-center gap-2.5 border-t border-brand-ink/5 pt-3">
        <Avatar
          firstName={trip.driver?.first_name}
          lastName={trip.driver?.last_name}
          photoUrl={trip.driver?.avatar_url}
          size="sm"
        />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-brand-ink">
            {trip.driver
              ? `${trip.driver.first_name} ${trip.driver.last_name}`
              : "Conducteur"}
          </p>
          <p className="text-xs text-brand-ink/70">
            {formatDate(trip.departure_date)} à {trip.departure_time.slice(0, 5)}
          </p>
        </div>
        <span
          className={`shrink-0 text-xs font-semibold ${
            complet ? "text-brand-ink/65" : "text-brand-green-dark"
          }`}
        >
          {complet
            ? "Complet"
            : `${trip.seats_available} place${trip.seats_available > 1 ? "s" : ""}`}
        </span>
      </div>
    </Link>
  );
}
