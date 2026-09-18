import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatCity } from "@/lib/format/city";
import { getTripById, getMyBookingForTrip } from "@/lib/carpool/queries";
import { BookingForm } from "@/components/carpool/BookingForm";
import { Alert } from "@/components/ui/Alert";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const trip = await getTripById(id);
  return {
    title: trip
      ? `${formatCity(trip.origin_city)} → ${formatCity(trip.destination_city)} — YanaTrust`
      : "Trajet — YanaTrust",
  };
}

export default async function TrajetDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ paiement?: string }>;
}) {
  const { id } = await params;
  const { paiement } = await searchParams;
  const trip = await getTripById(id);

  if (!trip) {
    notFound();
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isDriver = user?.id === trip.driver_id;
  const myBooking = user && !isDriver ? await getMyBookingForTrip(id) : null;

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-4 py-8">
      {paiement === "succes" ? (
        <Alert variant="success">
          Paiement en cours de confirmation. Votre réservation apparaîtra comme
          payée dans quelques instants.
        </Alert>
      ) : null}
      {paiement === "annule" ? <Alert>Paiement annulé.</Alert> : null}

      <div className="flex flex-col gap-2 rounded-xl bg-white shadow-sm shadow-black/5 p-4">
        <h1 className="text-xl font-bold text-brand-ink">
          {formatCity(trip.origin_city)} → {formatCity(trip.destination_city)}
        </h1>
        <p className="text-sm text-brand-ink/70">
          {new Date(`${trip.departure_date}T00:00:00`).toLocaleDateString("fr-FR", {
            weekday: "long",
            day: "numeric",
            month: "long",
          })}{" "}
          à {trip.departure_time.slice(0, 5)}
        </p>
        <p className="text-lg font-semibold text-brand-green-dark">
          {trip.price_per_seat} € / place
        </p>
        <p className="text-sm text-brand-ink/70">
          {trip.seats_available} place{trip.seats_available > 1 ? "s" : ""} restante
          {trip.seats_available > 1 ? "s" : ""} sur {trip.seats_total}
        </p>
        {trip.driver ? (
          <p className="text-xs text-brand-ink/65">
            Conducteur : {trip.driver.first_name} {trip.driver.last_name}
          </p>
        ) : null}
        {trip.description ? (
          <p className="mt-2 text-sm text-brand-ink/80">{trip.description}</p>
        ) : null}
        {trip.status === "cancelled" ? (
          <p className="text-sm font-semibold text-red-600">Ce trajet a été annulé.</p>
        ) : trip.status === "full" ? (
          <p className="text-sm font-semibold text-brand-ink/70">Ce trajet est complet.</p>
        ) : null}
      </div>

      {!user ? (
        <p className="rounded-xl bg-white shadow-sm shadow-black/5 p-4 text-center text-sm text-brand-ink/70">
          Connectez-vous pour réserver une place.
        </p>
      ) : isDriver ? (
        <p className="rounded-xl bg-white shadow-sm shadow-black/5 p-4 text-center text-sm text-brand-ink/70">
          C&rsquo;est votre trajet.
        </p>
      ) : myBooking ? (
        <div className="rounded-xl bg-white shadow-sm shadow-black/5 p-4">
          <p className="text-sm font-semibold text-brand-ink">
            {myBooking.status === "paid"
              ? "Votre réservation est confirmée et payée."
              : "Votre réservation est en attente de paiement."}
          </p>
          <p className="mt-1 text-sm text-brand-ink/70">
            {myBooking.seats_booked} place{myBooking.seats_booked > 1 ? "s" : ""} ·{" "}
            {myBooking.price_total} €
          </p>
        </div>
      ) : trip.status === "open" ? (
        <BookingForm
          tripId={trip.id}
          seatsAvailable={trip.seats_available}
          pricePerSeat={trip.price_per_seat}
        />
      ) : null}
    </div>
  );
}
