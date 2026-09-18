import type { Metadata } from "next";
import { getOpenRequests } from "@/lib/requests/queries";
import { SERVICE_CATEGORIES } from "@/lib/services/categories";
import { RequestCard } from "@/components/requests/RequestCard";

export const metadata: Metadata = {
  title: "Demandes ouvertes — YanaTrust",
};

export default async function DemandesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; categorie?: string }>;
}) {
  const { q, categorie } = await searchParams;
  const requests = await getOpenRequests({ search: q, category: categorie });

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-4 py-8">
      <h1 className="text-2xl font-bold text-brand-green-dark">
        Demandes de services
      </h1>
      <p className="text-sm text-brand-ink/70">
        Parcourez les demandes des habitants et postulez si vous pouvez les aider.
      </p>

      <form className="flex flex-col gap-3" method="get">
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Rechercher une demande..."
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
        <button
          type="submit"
          className="rounded-xl bg-brand-green-dark px-4 py-3 text-sm font-semibold text-brand-cream"
        >
          Rechercher
        </button>
      </form>

      {requests.length === 0 ? (
        <p className="rounded-xl bg-white shadow-sm shadow-black/5 p-6 text-center text-sm text-brand-ink/70">
          Aucune demande ouverte pour le moment.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {requests.map((request) => (
            <RequestCard key={request.id} request={request} />
          ))}
        </div>
      )}
    </div>
  );
}
