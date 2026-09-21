import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Droit d'accès et de portabilité : renvoie, dans un fichier JSON, tout ce que
 * l'application détient sur la personne connectée.
 *
 * L'export utilise la session de l'utilisateur, et non la clé d'administration :
 * les règles de sécurité de la base s'appliquent donc normalement, et il est
 * impossible d'obtenir par ce biais les données de quelqu'un d'autre, même en
 * manipulant la requête.
 */
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }

  const id = user.id;

  const [
    profil,
    telephone,
    services,
    demandes,
    candidatures,
    interventionsClient,
    interventionsPrestataire,
    conversations,
    messages,
    avisEcrits,
    avisRecus,
    trajets,
    reservations,
    notifications,
    signalements,
    favorisPrestataires,
    favorisServices,
  ] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", id).maybeSingle(),
    supabase.from("profile_phones").select("*").eq("id", id).maybeSingle(),
    supabase.from("services").select("*").eq("provider_id", id),
    supabase.from("requests").select("*").eq("client_id", id),
    supabase.from("request_applications").select("*").eq("provider_id", id),
    supabase.from("interventions").select("*").eq("client_id", id),
    supabase.from("interventions").select("*").eq("provider_id", id),
    supabase
      .from("conversations")
      .select("*")
      .or(`participant_one.eq.${id},participant_two.eq.${id}`),
    supabase.from("messages").select("*").eq("sender_id", id),
    supabase.from("reviews").select("*").eq("author_id", id),
    supabase.from("reviews").select("*").eq("provider_id", id),
    supabase.from("carpool_trips").select("*").eq("driver_id", id),
    supabase.from("carpool_bookings").select("*").eq("passenger_id", id),
    supabase.from("notifications").select("*").eq("user_id", id),
    supabase.from("reports").select("*").eq("reporter_id", id),
    supabase.from("favorite_providers").select("*").eq("user_id", id),
    supabase.from("favorite_services").select("*").eq("user_id", id),
  ]);

  const exportation = {
    genereLe: new Date().toISOString(),
    compte: {
      identifiant: user.id,
      email: user.email,
      creeLe: user.created_at,
      derniereConnexion: user.last_sign_in_at,
    },
    profil: profil.data,
    telephone: telephone.data,
    services: services.data,
    demandes: demandes.data,
    candidatures: candidatures.data,
    interventionsCommeClient: interventionsClient.data,
    interventionsCommePrestataire: interventionsPrestataire.data,
    conversations: conversations.data,
    messagesEnvoyes: messages.data,
    avisEcrits: avisEcrits.data,
    avisRecus: avisRecus.data,
    trajetsProposés: trajets.data,
    reservations: reservations.data,
    notifications: notifications.data,
    signalementsDeposes: signalements.data,
    favoris: {
      prestataires: favorisPrestataires.data,
      services: favorisServices.data,
    },
    note:
      "Les coordonnées bancaires et les détails de paiement ne figurent pas ici : " +
      "ils sont détenus par Stripe et n'ont jamais été enregistrés par YanaTrust. " +
      "Vous pouvez les demander directement à Stripe.",
  };

  const horodatage = new Date().toISOString().slice(0, 10);

  return new NextResponse(JSON.stringify(exportation, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="yanatrust-mes-donnees-${horodatage}.json"`,
      "Cache-Control": "no-store",
    },
  });
}
