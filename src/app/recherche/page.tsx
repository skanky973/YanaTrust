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
  searchParams: Promise<{ q?: string; categorie?: string }>;
}) {
  const { q, categorie } = await searchParams;
  const services = await getActiveServices({ search: q, category: categorie });
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
          className="rounded-xl border border-brand-ink/15 bg-white px-4 py-3 text-base text-brand-ink placeholder:text-brand-ink/40 focus:border-brand-green focus:outline-none focus:ring-2 focus:ring-brand-green/30"
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
        <button
          type="submit"
          className="rounded-xl bg-brand-green-dark px-4 py-3 text-sm font-semibold text-brand-cream"
        >
          Rechercher
        </button>
      </form>

      {services.length === 0 ? (
        <p className="rounded-xl bg-white p-6 text-center text-sm text-brand-ink/60">
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
