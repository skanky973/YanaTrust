import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, CalendarDays, Users } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { formatCity } from "@/lib/format/city";
import { getTripById, getMyBookingForTrip } from "@/lib/carpool/queries";
import { BookingForm } from "@/components/carpool/BookingForm";
import { Avatar } from "@/components/ui/Avatar";
import { Alert } from "@/components/ui/Alert";
import {
  paiementCovoiturageActif,
  COVOITURAGE_DESACTIVE_MESSAGE,
} from "@/lib/config/features";

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

      <Link
        href="/covoiturage"
        className="-mb-2 flex items-center gap-1 text-sm font-medium text-brand-green-dark"
      >
        <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        Tous les trajets
      </Link>

      <div className="flex flex-col gap-4 rounded-2xl bg-white p-4 shadow-sm shadow-black/5">
        {/* Même repère visuel que sur la carte de la liste : le trajet se lit
            de haut en bas, sans flèche qui se retrouve seule en bout de ligne
            quand les noms de ville sont longs. */}
        <div className="flex gap-3">
          <div className="flex flex-col items-center pt-2" aria-hidden="true">
            <span className="h-3 w-3 rounded-full border-2 border-brand-green" />
            <span className="my-1 w-px flex-1 bg-brand-ink/15" />
            <span className="h-3 w-3 rounded-full bg-brand-green-dark" />
          </div>
          <h1 className="flex min-w-0 flex-1 flex-col gap-3 text-xl font-bold leading-none text-brand-ink">
            <span className="break-words">{formatCity(trip.origin_city)}</span>
            <span className="break-words">{formatCity(trip.destination_city)}</span>
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-brand-ink/5 pt-3 text-sm">
          <p className="flex items-center gap-1.5 text-brand-ink/70">
            <CalendarDays className="h-4 w-4 text-brand-green" aria-hidden="true" />
            {new Date(`${trip.departure_date}T00:00:00`).toLocaleDateString("fr-FR", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}{" "}
            à {trip.departure_time.slice(0, 5)}
          </p>
          <p className="flex items-center gap-1.5 text-brand-ink/70">
            <Users className="h-4 w-4 text-brand-green" aria-hidden="true" />
            {trip.seats_available} place{trip.seats_available > 1 ? "s" : ""} sur{" "}
            {trip.seats_total}
          </p>
        </div>

        <p className="text-2xl font-bold text-brand-green-dark">
          {trip.price_per_seat} €{" "}
          <span className="text-base font-medium text-brand-ink/70">par place</span>
        </p>

        {trip.status === "cancelled" ? (
          <p className="rounded-xl bg-red-50 px-3 py-2 text-sm font-semibold text-red-600">
            Ce trajet a été annulé.
          </p>
        ) : trip.status === "full" ? (
          <p className="rounded-xl bg-brand-ink/5 px-3 py-2 text-sm font-semibold text-brand-ink/70">
            Ce trajet est complet.
          </p>
        ) : null}
      </div>

      {/* Le conducteur a son propre bloc : c'est à lui que le passager confie
          son argent et son trajet, pas à une ligne de texte en bas de fiche. */}
      {trip.driver ? (
        <div className="flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-sm shadow-black/5">
          <div className="flex items-center gap-3">
            <Avatar
              firstName={trip.driver.first_name}
              lastName={trip.driver.last_name}
              photoUrl={trip.driver.avatar_url}
              size="md"
            />
            <div className="min-w-0">
              <p className="text-xs text-brand-ink/65">Conducteur</p>
              <p className="truncate font-semibold text-brand-ink">
                {trip.driver.first_name} {trip.driver.last_name}
              </p>
            </div>
          </div>
          {trip.description ? (
            <p className="rounded-xl bg-brand-cream/60 px-3 py-2 text-sm text-brand-ink/80">
              {trip.description}
            </p>
          ) : null}
        </div>
      ) : null}

      {/* La suspension est annoncée avant tout le reste, y compris avant
          l'invitation à se connecter : inviter quelqu'un à créer un compte
          pour une action indisponible serait une perte de temps déguisée. */}
      {!paiementCovoiturageActif() ? (
        <p className="rounded-xl bg-brand-gold/15 p-4 text-sm text-brand-ink/80">
          {COVOITURAGE_DESACTIVE_MESSAGE}
        </p>
      ) : !user ? (
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
