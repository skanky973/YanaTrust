import Link from "next/link";
import type { TripWithDriver } from "@/lib/carpool/queries";

function formatDate(dateStr: string) {
  return new Date(`${dateStr}T00:00:00`).toLocaleDateString("fr-FR", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

export function TripCard({ trip }: { trip: TripWithDriver }) {
  return (
    <Link
      href={`/covoiturage/${trip.id}`}
      className="flex flex-col gap-1 rounded-xl bg-white shadow-sm shadow-black/5 p-4"
    >
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-semibold text-brand-ink">
          {trip.origin_city} → {trip.destination_city}
        </h2>
        <span className="shrink-0 rounded-full bg-brand-green/10 px-2 py-0.5 text-xs font-semibold text-brand-green-dark">
          {trip.price_per_seat} € / place
        </span>
      </div>
      <p className="text-xs text-brand-ink/60">
        {formatDate(trip.departure_date)} à {trip.departure_time.slice(0, 5)}
        {trip.driver ? ` · ${trip.driver.first_name} ${trip.driver.last_name}` : ""}
      </p>
      <p className="text-xs text-brand-ink/50">
        {trip.seats_available} place{trip.seats_available > 1 ? "s" : ""} restante
        {trip.seats_available > 1 ? "s" : ""}
      </p>
    </Link>
  );
}
