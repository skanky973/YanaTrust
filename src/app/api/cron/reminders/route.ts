import { NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/service-role";

// Appelé une fois par jour par Vercel Cron (voir vercel.json). Envoie un
// rappel aux deux parties pour chaque intervention confirmée prévue le
// lendemain, et marque reminder_sent pour ne jamais rappeler deux fois.
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }

  const supabase = createServiceRoleClient();

  const tomorrow = new Date();
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
  const tomorrowDate = tomorrow.toISOString().slice(0, 10);

  const { data: interventions, error } = await supabase
    .from("interventions")
    .select("id, provider_id, client_id, title, scheduled_date, start_time")
    .eq("status", "confirmed")
    .eq("reminder_sent", false)
    .eq("scheduled_date", tomorrowDate);

  if (error) {
    console.error("cron/reminders:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  for (const intervention of interventions ?? []) {
    const body = `${intervention.title} — demain à ${intervention.start_time.slice(0, 5)}.`;

    await supabase.from("notifications").insert([
      {
        user_id: intervention.client_id,
        type: "upcoming_intervention",
        title: "Rappel : intervention demain",
        body,
        intervention_id: intervention.id,
      },
      {
        user_id: intervention.provider_id,
        type: "upcoming_intervention",
        title: "Rappel : intervention demain",
        body,
        intervention_id: intervention.id,
      },
    ]);

    await supabase
      .from("interventions")
      .update({ reminder_sent: true })
      .eq("id", intervention.id);
  }

  // Clôture des trajets de covoiturage dont la date de départ est passée.
  // La recherche les masque déjà (getOpenTrips filtre sur la date), mais sans
  // ça leur statut reste "ouvert" indéfiniment côté conducteur, et le libellé
  // "Terminé" de MyTripCard n'est jamais atteint.
  const today = new Date().toISOString().slice(0, 10);

  const { data: pastTrips, error: tripsError } = await supabase
    .from("carpool_trips")
    .update({ status: "completed" })
    .lt("departure_date", today)
    .in("status", ["open", "full"])
    .select("id");

  if (tripsError) {
    console.error("cron/trajets termines:", tripsError.message);
  }

  return NextResponse.json({
    remindersSent: interventions?.length ?? 0,
    tripsCompleted: pastTrips?.length ?? 0,
  });
}
