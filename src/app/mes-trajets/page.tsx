import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getMyTrips } from "@/lib/carpool/queries";
import { MyTripCard } from "@/components/carpool/MyTripCard";
import { LinkButton } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Mes trajets — YanaTrust",
};

export default async function MesTrajetsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/connexion?suivant=/mes-trajets");
  }

  const trips = await getMyTrips();

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-4 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-brand-green-dark">Mes trajets</h1>
        <LinkButton href="/covoiturage/nouveau" variant="primary" className="px-3 py-2 text-xs">
          + Trajet
        </LinkButton>
      </div>

      {trips.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl bg-white shadow-sm shadow-black/5 p-8 text-center">
          <p className="text-sm text-brand-ink/60">
            Vous n&rsquo;avez encore publié aucun trajet.
          </p>
          <LinkButton href="/covoiturage/nouveau" variant="primary">
            Publier mon premier trajet
          </LinkButton>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {trips.map((trip) => (
            <MyTripCard key={trip.id} trip={trip} />
          ))}
        </div>
      )}
    </div>
  );
}
