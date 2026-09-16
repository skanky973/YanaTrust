import Link from "next/link";
import { cancelTrip } from "@/lib/actions/carpool";
import type { CarpoolTrip } from "@/lib/supabase/database.types";

const STATUS_LABELS: Record<string, string> = {
  open: "Ouvert",
  full: "Complet",
  completed: "Terminé",
  cancelled: "Annulé",
};

const STATUS_STYLES: Record<string, string> = {
  open: "bg-brand-green/15 text-brand-green-dark",
  full: "bg-amber-100 text-amber-700",
  completed: "bg-teal-100 text-teal-700",
  cancelled: "bg-red-100 text-red-600",
};

export function MyTripCard({ trip }: { trip: CarpoolTrip }) {
  return (
    <div className="flex flex-col gap-2 rounded-xl bg-white shadow-sm shadow-black/5 p-4">
      <div className="flex items-start justify-between gap-3">
        <Link href={`/covoiturage/${trip.id}`} className="font-semibold text-brand-ink hover:underline">
          {trip.origin_city} → {trip.destination_city}
        </Link>
        <span
          className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_STYLES[trip.status] ?? "bg-brand-ink/10 text-brand-ink/60"}`}
        >
          {STATUS_LABELS[trip.status] ?? trip.status}
        </span>
      </div>
      <p className="text-xs text-brand-ink/60">
        {new Date(`${trip.departure_date}T00:00:00`).toLocaleDateString("fr-FR")} à{" "}
        {trip.departure_time.slice(0, 5)} · {trip.price_per_seat} € / place
      </p>
      <p className="text-xs text-brand-ink/50">
        {trip.seats_available} / {trip.seats_total} places restantes
      </p>
      {trip.status === "open" || trip.status === "full" ? (
        <form action={cancelTrip.bind(null, trip.id)}>
          <button type="submit" className="text-xs font-medium text-red-600 underline">
            Annuler ce trajet
          </button>
        </form>
      ) : null}
    </div>
  );
}
