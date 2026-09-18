import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe/client";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { getOrCreateConversation } from "@/lib/conversations/get-or-create";

// Reçoit les événements Stripe (paiement confirmé, session expirée, compte
// conducteur mis à jour). La signature garantit que la requête vient bien de
// Stripe ; ce endpoint tourne donc sans utilisateur connecté, d'où l'usage
// du client service_role pour écrire en base.
export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Signature manquante." }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error("stripe webhook signature:", (err as Error).message);
    return NextResponse.json({ error: "Signature invalide." }, { status: 400 });
  }

  const supabase = createServiceRoleClient();

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const bookingId = session.metadata?.bookingId;

    if (bookingId) {
      const paymentIntentId =
        typeof session.payment_intent === "string"
          ? session.payment_intent
          : (session.payment_intent?.id ?? null);

      const { data: booking } = await supabase
        .from("carpool_bookings")
        .update({ status: "paid", stripe_payment_intent_id: paymentIntentId })
        .eq("id", bookingId)
        .eq("status", "pending_payment")
        .select("trip_id, passenger_id, seats_booked")
        .single();

      if (booking) {
        const { data: trip } = await supabase
          .from("carpool_trips")
          .select(
            "driver_id, origin_city, destination_city, departure_date, departure_time",
          )
          .eq("id", booking.trip_id)
          .single();

        if (trip) {
          // Une fois la place payée, passager et conducteur doivent pouvoir se
          // joindre (point de rendez-vous, retard, bagages). On ouvre donc la
          // conversation sans attendre que l'un des deux en prenne l'initiative.
          // Si elle existe déjà, elle est simplement réutilisée.
          const conversationId = await getOrCreateConversation(
            supabase,
            booking.passenger_id,
            trip.driver_id,
          );

          if (conversationId) {
            const jour = new Date(
              `${trip.departure_date}T00:00:00`,
            ).toLocaleDateString("fr-FR", {
              weekday: "long",
              day: "numeric",
              month: "long",
            });
            const places = `${booking.seats_booked} place${booking.seats_booked > 1 ? "s" : ""}`;

            await supabase.from("messages").insert({
              conversation_id: conversationId,
              sender_id: null,
              is_system: true,
              content:
                `Réservation confirmée : ${trip.origin_city} → ${trip.destination_city}, ` +
                `${places} le ${jour} à ${trip.departure_time.slice(0, 5)}. ` +
                `Convenez ici de votre point de rendez-vous.`,
            });
          }

          const notifBody = `${trip.origin_city} → ${trip.destination_city} le ${trip.departure_date}`;
          await supabase.from("notifications").insert([
            {
              user_id: booking.passenger_id,
              type: "carpool_booking_paid",
              title: "Réservation confirmée",
              body: notifBody,
            },
            {
              user_id: trip.driver_id,
              type: "carpool_booking_paid",
              title: "Nouvelle réservation payée",
              body: notifBody,
            },
          ]);
        }
      }
    }
  }

  if (event.type === "checkout.session.expired") {
    const session = event.data.object as Stripe.Checkout.Session;
    const bookingId = session.metadata?.bookingId;
    if (bookingId) {
      await supabase.rpc("cancel_carpool_booking", { p_booking_id: bookingId });
    }
  }

  if (event.type === "account.updated") {
    const account = event.data.object as Stripe.Account;
    await supabase
      .from("stripe_accounts")
      .update({
        payouts_enabled: !!account.payouts_enabled,
        details_submitted: !!account.details_submitted,
      })
      .eq("stripe_account_id", account.id);
  }

  return NextResponse.json({ received: true });
}
