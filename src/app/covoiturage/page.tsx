import type { Metadata } from "next";
import Link from "next/link";
import { Car } from "lucide-react";
import { getOpenTrips } from "@/lib/carpool/queries";
import { TripCard } from "@/components/carpool/TripCard";
import { LinkButton } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Covoiturage — YanaTrust",
};

export default async function CovoiturageParcourirPage({
  searchParams,
}: {
  searchParams: Promise<{ depart?: string; arrivee?: string }>;
}) {
  const { depart, arrivee } = await searchParams;
  const trips = await getOpenTrips({ origin: depart, destination: arrivee });

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-4 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-brand-green-dark">Covoiturage</h1>
        <LinkButton href="/covoiturage/nouveau" variant="primary" className="px-3 py-2 text-xs">
          + Trajet
        </LinkButton>
      </div>

      <form className="flex flex-col gap-3" method="get">
        <div className="grid grid-cols-2 gap-3">
          <input
            type="search"
            name="depart"
            defaultValue={depart}
            placeholder="Ville de départ"
            className="rounded-xl border border-brand-ink/15 bg-white px-4 py-3 text-base text-brand-ink placeholder:text-brand-ink/40 focus:border-brand-green focus:outline-none focus:ring-2 focus:ring-brand-green/30"
          />
          <input
            type="search"
            name="arrivee"
            defaultValue={arrivee}
            placeholder="Ville d'arrivée"
            className="rounded-xl border border-brand-ink/15 bg-white px-4 py-3 text-base text-brand-ink placeholder:text-brand-ink/40 focus:border-brand-green focus:outline-none focus:ring-2 focus:ring-brand-green/30"
          />
        </div>
        <button
          type="submit"
          className="rounded-xl bg-brand-green-dark px-4 py-3 text-sm font-semibold text-brand-cream"
        >
          Rechercher
        </button>
      </form>

      {trips.length === 0 ? (
        /* Un écran vide ne doit pas ressembler à une page cassée : on dit
           pourquoi il n'y a rien, et on propose la seule action utile. */
        <div className="flex flex-col items-center gap-3 rounded-2xl bg-white px-6 py-10 text-center shadow-sm shadow-black/5">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-green/10">
            <Car className="h-7 w-7 text-brand-green-dark" aria-hidden="true" />
          </span>
          <p className="font-semibold text-brand-ink">
            {depart || arrivee
              ? "Aucun trajet sur cet itinéraire"
              : "Aucun trajet proposé pour le moment"}
          </p>
          <p className="max-w-xs text-sm text-brand-ink/60">
            {depart || arrivee
              ? "Essayez une autre ville, ou proposez vous-même ce trajet."
              : "Soyez le premier à proposer des places dans votre voiture."}
          </p>
          <LinkButton href="/covoiturage/nouveau" variant="primary" className="mt-1">
            Proposer un trajet
          </LinkButton>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {trips.map((trip) => (
            <TripCard key={trip.id} trip={trip} />
          ))}
        </div>
      )}

      <Link href="/mes-reservations" className="text-center text-sm text-brand-green-dark">
        Voir mes réservations
      </Link>
    </div>
  );
}
