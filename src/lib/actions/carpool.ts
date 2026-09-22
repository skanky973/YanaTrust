"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import { createClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe/client";
import { getSiteUrl } from "@/lib/site-url";
import { tripFormSchema } from "@/lib/validation/carpool";
import { createNotification } from "@/lib/notifications/create";
import {
  aUnePhotoDeProfil,
  AVATAR_REQUIS_MESSAGE,
} from "@/lib/profiles/require-avatar";
import {
  paiementCovoiturageActif,
  COVOITURAGE_DESACTIVE_MESSAGE,
} from "@/lib/config/features";
import type { ActionState } from "@/lib/actions/action-state";

// Rembourse effectivement l'argent chez Stripe, puis seulement en cas de
// succès marque la réservation comme remboursée. L'ordre compte : une
// réservation affichée "Remboursée" alors que l'argent n'est pas reparti
// serait un mensonge fait au passager.
// reverse_transfer et refund_application_fee sont indispensables ici : le
// paiement est un "destination charge", l'argent est déjà chez le conducteur
// et la commission chez nous — il faut reprendre les deux pour rembourser.
async function refundPaidBooking(
  supabase: SupabaseClient<Database>,
  booking: { id: string; stripe_payment_intent_id: string | null },
): Promise<boolean> {
  if (!booking.stripe_payment_intent_id) {
    console.error("refundPaidBooking: aucun paiement Stripe", booking.id);
    return false;
  }

  try {
    await getStripe().refunds.create({
      payment_intent: booking.stripe_payment_intent_id,
      refund_application_fee: true,
      reverse_transfer: true,
    });
  } catch (err) {
    console.error("refundPaidBooking:", booking.id, (err as Error).message);
    return false;
  }

  const { error } = await supabase.rpc("refund_carpool_booking", {
    p_booking_id: booking.id,
  });

  if (error) {
    // L'argent est bien reparti mais la base n'a pas suivi : à corriger à la
    // main, d'où un log explicite plutôt qu'un échec silencieux.
    console.error("refundPaidBooking (base):", booking.id, error.message);
  }

  return true;
}

async function requireCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Non authentifié.");
  }

  return { supabase, userId: user.id };
}

export async function publishTrip(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = tripFormSchema.safeParse({
    originCity: formData.get("originCity"),
    destinationCity: formData.get("destinationCity"),
    departureDate: formData.get("departureDate"),
    departureTime: formData.get("departureTime"),
    seatsTotal: formData.get("seatsTotal"),
    pricePerSeat: formData.get("pricePerSeat"),
    description: formData.get("description"),
  });

  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }

  const { supabase, userId } = await requireCurrentUser();

  if (!(await aUnePhotoDeProfil(supabase, userId))) {
    return { error: AVATAR_REQUIS_MESSAGE };
  }

  // Aucune condition de statut prestataire : n'importe quel compte peut
  // proposer un trajet. Seule l'activation des paiements est nécessaire.
  const { data: stripeAccount } = await supabase
    .from("stripe_accounts")
    .select("payouts_enabled")
    .eq("id", userId)
    .maybeSingle();

  if (!stripeAccount?.payouts_enabled) {
    return {
      error:
        "Configurez d'abord vos paiements (Profil → Paiements) avant de publier un trajet.",
    };
  }

  const {
    originCity,
    destinationCity,
    departureDate,
    departureTime,
    seatsTotal,
    pricePerSeat,
    description,
  } = parsed.data;

  const { error } = await supabase.from("carpool_trips").insert({
    driver_id: userId,
    origin_city: originCity,
    destination_city: destinationCity,
    departure_date: departureDate,
    departure_time: departureTime,
    seats_total: seatsTotal,
    seats_available: seatsTotal,
    price_per_seat: pricePerSeat,
    description: description || null,
  });

  if (error) {
    return { error: "Impossible de publier le trajet." };
  }

  redirect("/mes-trajets");
}

export async function cancelTrip(tripId: string) {
  const { supabase, userId } = await requireCurrentUser();

  const { data: trip } = await supabase
    .from("carpool_trips")
    .select("origin_city, destination_city")
    .eq("id", tripId)
    .eq("driver_id", userId)
    .single();

  if (!trip) return;

  const { data: bookings } = await supabase
    .from("carpool_bookings")
    .select("id, passenger_id, status, stripe_payment_intent_id")
    .eq("trip_id", tripId)
    .in("status", ["pending_payment", "paid"]);

  await supabase
    .from("carpool_trips")
    .update({ status: "cancelled" })
    .eq("id", tripId)
    .eq("driver_id", userId);

  const trajet = `${trip.origin_city} → ${trip.destination_city}`;

  for (const booking of bookings ?? []) {
    let body = trajet;

    if (booking.status === "paid") {
      const refunded = await refundPaidBooking(supabase, booking);
      body = refunded
        ? `${trajet} — vous êtes intégralement remboursé, sous 5 à 10 jours selon votre banque.`
        : `${trajet} — le remboursement automatique a échoué, contactez-nous pour être remboursé.`;
    } else {
      await supabase.rpc("cancel_carpool_booking", { p_booking_id: booking.id });
    }

    await createNotification(supabase, {
      userId: booking.passenger_id,
      type: "carpool_trip_cancelled",
      title: "Trajet annulé par le conducteur",
      body,
    });
  }

  revalidatePath("/mes-trajets");
  revalidatePath(`/covoiturage/${tripId}`);
}

export async function createBookingCheckout(
  tripId: string,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const seats = Number(formData.get("seats"));
  if (!Number.isInteger(seats) || seats < 1) {
    return { error: "Nombre de places invalide." };
  }

  // Contrôle placé avant tout le reste : c'est ici que l'argent commence à
  // circuler, et masquer le bouton dans la page ne protégerait de rien.
  if (!paiementCovoiturageActif()) {
    return { error: COVOITURAGE_DESACTIVE_MESSAGE };
  }

  const { supabase, userId } = await requireCurrentUser();

  if (!(await aUnePhotoDeProfil(supabase, userId))) {
    return { error: AVATAR_REQUIS_MESSAGE };
  }

  const { data: trip } = await supabase
    .from("carpool_trips")
    .select("origin_city, destination_city, departure_date, departure_time, driver_id")
    .eq("id", tripId)
    .single();

  if (!trip) {
    return { error: "Trajet introuvable." };
  }

  // La recherche masque les trajets passés, mais un lien direct vers la page
  // du trajet, lui, reste accessible : on refuse donc ici aussi, côté serveur.
  const departure = new Date(`${trip.departure_date}T${trip.departure_time}`);
  if (Number.isFinite(departure.getTime()) && departure.getTime() <= Date.now()) {
    return { error: "Ce trajet est déjà parti." };
  }

  // La RLS de stripe_accounts ne laisse chacun lire que sa propre ligne : un
  // passager ne peut donc pas interroger la table pour le conducteur. On passe
  // par une fonction security definer, limitée au compte de paiement du
  // conducteur de ce trajet précis.
  const { data: payoutAccounts } = await supabase.rpc("get_trip_payout_account", {
    p_trip_id: tripId,
  });

  const driverStripe = payoutAccounts?.[0];

  if (!driverStripe?.payouts_enabled) {
    return { error: "Ce conducteur n'a pas encore activé les paiements." };
  }

  const { data: bookingId, error: rpcError } = await supabase.rpc(
    "create_carpool_booking",
    { p_trip_id: tripId, p_seats: seats },
  );

  if (rpcError || !bookingId) {
    const message = rpcError?.message ?? "";
    return {
      error: message.includes("déjà une réservation")
        ? "Vous avez déjà une réservation en cours sur ce trajet. Retrouvez-la dans « Mes réservations »."
        : message.includes("places")
          ? "Il ne reste pas assez de places sur ce trajet."
          : message.includes("propre trajet")
            ? "Vous ne pouvez pas réserver votre propre trajet."
            : "Impossible de créer la réservation.",
    };
  }

  const { data: booking } = await supabase
    .from("carpool_bookings")
    .select("price_total, platform_fee")
    .eq("id", bookingId)
    .single();

  if (!booking) {
    return { error: "Réservation introuvable." };
  }

  const siteUrl = await getSiteUrl();
  const priceTotalCents = Math.round(booking.price_total * 100);
  const platformFeeCents = Math.round(booking.platform_fee * 100);

  const session = await getStripe().checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: "eur",
          unit_amount: priceTotalCents,
          product_data: {
            name: `Covoiturage ${trip.origin_city} → ${trip.destination_city}`,
            description: `${seats} place(s) le ${trip.departure_date} à ${trip.departure_time.slice(0, 5)}`,
          },
        },
        quantity: 1,
      },
    ],
    payment_intent_data: {
      application_fee_amount: platformFeeCents,
      transfer_data: {
        destination: driverStripe.stripe_account_id,
      },
    },
    success_url: `${siteUrl}/covoiturage/${tripId}?paiement=succes`,
    cancel_url: `${siteUrl}/covoiturage/${tripId}?paiement=annule`,
    metadata: { bookingId },
  });

  if (!session.url) {
    return { error: "Impossible de créer la session de paiement." };
  }

  await supabase
    .from("carpool_bookings")
    .update({ stripe_checkout_session_id: session.id })
    .eq("id", bookingId);

  return { success: true, redirectTo: session.url };
}

export async function cancelMyBooking(bookingId: string) {
  const { supabase } = await requireCurrentUser();
  await supabase.rpc("cancel_carpool_booking", { p_booking_id: bookingId });
  revalidatePath("/mes-reservations");
}

// Désistement d'un passager ayant déjà payé : remboursement intégral tant que
// le trajet n'est pas parti, et les places repartent immédiatement à la vente.
export async function cancelMyPaidBooking(bookingId: string): Promise<void> {
  const { supabase, userId } = await requireCurrentUser();

  const { data: booking } = await supabase
    .from("carpool_bookings")
    .select("id, trip_id, seats_booked, status, stripe_payment_intent_id")
    .eq("id", bookingId)
    .eq("passenger_id", userId)
    .maybeSingle();

  if (!booking || booking.status !== "paid") return;

  const { data: trip } = await supabase
    .from("carpool_trips")
    .select("driver_id, origin_city, destination_city, departure_date, departure_time")
    .eq("id", booking.trip_id)
    .single();

  if (!trip) return;

  // Passé l'heure du départ, il n'y a plus rien à rembourser : la place a été
  // immobilisée et le conducteur a fait le trajet.
  const departure = new Date(`${trip.departure_date}T${trip.departure_time}`);
  if (Number.isFinite(departure.getTime()) && departure.getTime() <= Date.now()) {
    return;
  }

  if (!(await refundPaidBooking(supabase, booking))) return;

  const places = `${booking.seats_booked} place${booking.seats_booked > 1 ? "s" : ""}`;

  await createNotification(supabase, {
    userId: trip.driver_id,
    type: "carpool_booking_refunded",
    title: "Un passager s'est désisté",
    body: `${trip.origin_city} → ${trip.destination_city} — ${places} de nouveau disponible${booking.seats_booked > 1 ? "s" : ""}.`,
  });

  revalidatePath("/mes-reservations");
  revalidatePath(`/covoiturage/${booking.trip_id}`);
  revalidatePath("/covoiturage");
}
