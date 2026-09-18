import type { Metadata } from "next";
import { getActiveServices, getCoverPhotoByService } from "@/lib/services/queries";
import { SERVICE_CATEGORIES } from "@/lib/services/categories";
import { ServiceCard } from "@/components/services/ServiceCard";

export const metadata: Metadata = {
  title: "Recherche — YanaTrust",
};

export default async function RecherchePage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    categorie?: string;
    ville?: string;
    prixMin?: string;
    prixMax?: string;
    noteMin?: string;
  }>;
}) {
  const { q, categorie, ville, prixMin, prixMax, noteMin } = await searchParams;

  const services = await getActiveServices({
    search: q,
    category: categorie,
    city: ville,
    minPrice: prixMin ? Number(prixMin) : undefined,
    maxPrice: prixMax ? Number(prixMax) : undefined,
    minRating: noteMin ? Number(noteMin) : undefined,
  });
  const coverPhotos = await getCoverPhotoByService(services.map((s) => s.id));

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-4 py-8">
      <h1 className="text-2xl font-bold text-brand-green-dark">
        Trouver un service
      </h1>

      <form className="flex flex-col gap-3" method="get">
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Rechercher un service..."
          className="rounded-xl border border-brand-ink/15 bg-white px-4 py-3 text-base text-brand-ink placeholder:text-brand-ink/65 focus:border-brand-green focus:outline-none focus:ring-2 focus:ring-brand-green/30"
        />
        <select
          name="categorie"
          defaultValue={categorie ?? ""}
          className="rounded-xl border border-brand-ink/15 bg-white px-4 py-3 text-base text-brand-ink focus:border-brand-green focus:outline-none focus:ring-2 focus:ring-brand-green/30"
        >
          <option value="">Toutes les catégories</option>
          {SERVICE_CATEGORIES.map(({ value, label }) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>

        <details className="group rounded-xl bg-white shadow-sm shadow-black/5" open={!!(ville || prixMin || prixMax || noteMin)}>
          <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 text-sm font-semibold text-brand-green-dark [&::-webkit-details-marker]:hidden">
            Filtres avancés (ville, prix, note)
            <span
              aria-hidden="true"
              className="text-brand-green-dark/50 transition-transform group-open:rotate-180"
            >
              ⌄
            </span>
          </summary>
          <div className="flex flex-col gap-3 px-4 pb-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="ville" className="text-sm font-medium text-brand-ink">
                Ville
              </label>
              <input
                id="ville"
                type="text"
                name="ville"
                defaultValue={ville}
                placeholder="Ex : Saint-Laurent-du-Maroni"
                className="rounded-xl border border-brand-ink/15 bg-white px-4 py-3 text-base text-brand-ink placeholder:text-brand-ink/65 focus:border-brand-green focus:outline-none focus:ring-2 focus:ring-brand-green/30"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="prixMin" className="text-sm font-medium text-brand-ink">
                  Prix min (€)
                </label>
                <input
                  id="prixMin"
                  type="number"
                  name="prixMin"
                  min="0"
                  step="0.01"
                  defaultValue={prixMin}
                  className="rounded-xl border border-brand-ink/15 bg-white px-4 py-3 text-base text-brand-ink focus:border-brand-green focus:outline-none focus:ring-2 focus:ring-brand-green/30"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="prixMax" className="text-sm font-medium text-brand-ink">
                  Prix max (€)
                </label>
                <input
                  id="prixMax"
                  type="number"
                  name="prixMax"
                  min="0"
                  step="0.01"
                  defaultValue={prixMax}
                  className="rounded-xl border border-brand-ink/15 bg-white px-4 py-3 text-base text-brand-ink focus:border-brand-green focus:outline-none focus:ring-2 focus:ring-brand-green/30"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="noteMin" className="text-sm font-medium text-brand-ink">
                Note minimale du prestataire
              </label>
              <select
                id="noteMin"
                name="noteMin"
                defaultValue={noteMin ?? ""}
                className="rounded-xl border border-brand-ink/15 bg-white px-4 py-3 text-base text-brand-ink focus:border-brand-green focus:outline-none focus:ring-2 focus:ring-brand-green/30"
              >
                <option value="">Toutes les notes</option>
                <option value="4">4 étoiles et plus</option>
                <option value="3">3 étoiles et plus</option>
                <option value="2">2 étoiles et plus</option>
                <option value="1">1 étoile et plus</option>
              </select>
            </div>
          </div>
        </details>

        <button
          type="submit"
          className="rounded-xl bg-brand-green-dark px-4 py-3 text-sm font-semibold text-brand-cream"
        >
          Rechercher
        </button>
      </form>

      {services.length === 0 ? (
        <p className="rounded-xl bg-white shadow-sm shadow-black/5 p-6 text-center text-sm text-brand-ink/70">
          Aucun service ne correspond à votre recherche pour le moment.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {services.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              coverPhotoUrl={coverPhotos.get(service.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
