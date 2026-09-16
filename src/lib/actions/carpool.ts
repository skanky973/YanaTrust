"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe/client";
import { getSiteUrl } from "@/lib/site-url";
import { tripFormSchema } from "@/lib/validation/carpool";
import { createNotification } from "@/lib/notifications/create";
import type { ActionState } from "@/lib/actions/action-state";

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

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_provider")
    .eq("id", userId)
    .single();

  if (!profile?.is_provider) {
    return { error: "Seul un compte prestataire peut publier un trajet." };
  }

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
    .select("passenger_id, status")
    .eq("trip_id", tripId)
    .in("status", ["pending_payment", "paid"]);

  await supabase
    .from("carpool_trips")
    .update({ status: "cancelled" })
    .eq("id", tripId)
    .eq("driver_id", userId);

  for (const booking of bookings ?? []) {
    await createNotification(supabase, {
      userId: booking.passenger_id,
      type: "carpool_trip_cancelled",
      title: "Trajet annulé par le conducteur",
      body:
        booking.status === "paid"
          ? `${trip.origin_city} → ${trip.destination_city} — vous serez remboursé, contactez le support si besoin.`
          : `${trip.origin_city} → ${trip.destination_city}`,
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

  const { supabase } = await requireCurrentUser();

  const { data: trip } = await supabase
    .from("carpool_trips")
    .select("origin_city, destination_city, departure_date, departure_time, driver_id")
    .eq("id", tripId)
    .single();

  if (!trip) {
    return { error: "Trajet introuvable." };
  }

  const { data: driverStripe } = await supabase
    .from("stripe_accounts")
    .select("stripe_account_id, payouts_enabled")
    .eq("id", trip.driver_id)
    .maybeSingle();

  if (!driverStripe?.payouts_enabled) {
    return { error: "Ce conducteur n'a pas encore activé les paiements." };
  }

  const { data: bookingId, error: rpcError } = await supabase.rpc(
    "create_carpool_booking",
    { p_trip_id: tripId, p_seats: seats },
  );

  if (rpcError || !bookingId) {
    return {
      error: rpcError?.message.includes("places")
        ? "Il ne reste pas assez de places sur ce trajet."
        : rpcError?.message.includes("propre trajet")
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
