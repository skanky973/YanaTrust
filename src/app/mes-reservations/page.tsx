import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getMyBookings } from "@/lib/carpool/queries";
import { cancelMyBooking, cancelMyPaidBooking } from "@/lib/actions/carpool";

export const metadata: Metadata = {
  title: "Mes réservations — YanaTrust",
};

const STATUS_LABELS: Record<string, string> = {
  pending_payment: "En attente de paiement",
  paid: "Payée",
  cancelled: "Annulée",
  refunded: "Remboursée",
};

const STATUS_STYLES: Record<string, string> = {
  pending_payment: "bg-amber-100 text-amber-700",
  paid: "bg-brand-green/15 text-brand-green-dark",
  cancelled: "bg-slate-100 text-slate-600",
  refunded: "bg-slate-100 text-slate-600",
};

export default async function MesReservationsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/connexion?suivant=/mes-reservations");
  }

  const bookings = await getMyBookings();

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-4 py-8">
      <h1 className="text-2xl font-bold text-brand-green-dark">Mes réservations</h1>

      {bookings.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl bg-white shadow-sm shadow-black/5 p-8 text-center">
          <p className="text-sm text-brand-ink/60">
            Vous n&rsquo;avez encore réservé aucun trajet.
          </p>
          <Link
            href="/covoiturage"
            className="rounded-xl bg-brand-green-dark px-4 py-2 text-sm font-semibold text-brand-cream"
          >
            Parcourir les trajets
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {bookings.map((booking) => (
            <div key={booking.id} className="flex flex-col gap-2 rounded-xl bg-white shadow-sm shadow-black/5 p-4">
              <div className="flex items-start justify-between gap-3">
                <Link
                  href={booking.trip ? `/covoiturage/${booking.trip.id}` : "#"}
                  className="font-semibold text-brand-ink hover:underline"
                >
                  {booking.trip
                    ? `${booking.trip.origin_city} → ${booking.trip.destination_city}`
                    : "Trajet introuvable"}
                </Link>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_STYLES[booking.status] ?? "bg-brand-ink/10 text-brand-ink/60"}`}
                >
                  {STATUS_LABELS[booking.status] ?? booking.status}
                </span>
              </div>
              {booking.trip ? (
                <p className="text-xs text-brand-ink/60">
                  {new Date(`${booking.trip.departure_date}T00:00:00`).toLocaleDateString("fr-FR")}{" "}
                  à {booking.trip.departure_time.slice(0, 5)}
                </p>
              ) : null}
              <p className="text-xs text-brand-ink/50">
                {booking.seats_booked} place{booking.seats_booked > 1 ? "s" : ""} · {booking.price_total} €
              </p>
              {booking.status === "pending_payment" ? (
                <form action={cancelMyBooking.bind(null, booking.id)}>
                  <button type="submit" className="text-xs font-medium text-red-600 underline">
                    Annuler la réservation
                  </button>
                </form>
              ) : booking.status === "paid" &&
                booking.trip &&
                new Date(
                  `${booking.trip.departure_date}T${booking.trip.departure_time}`,
                ) > new Date() ? (
                <form action={cancelMyPaidBooking.bind(null, booking.id)}>
                  <button type="submit" className="text-xs font-medium text-red-600 underline">
                    Me désister et être remboursé
                  </button>
                  <p className="mt-1 text-[10px] text-brand-ink/40">
                    Remboursement intégral jusqu&rsquo;à l&rsquo;heure du départ.
                  </p>
                </form>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
