import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getMyInterventionsAsClient } from "@/lib/interventions/queries";
import { InterventionCard } from "@/components/interventions/InterventionCard";
import type { InterventionWithParties } from "@/lib/interventions/queries";

export const metadata: Metadata = {
  title: "Mes interventions — YanaTrust",
};

const TABS = [
  { value: "attente", label: "En attente de validation" },
  { value: "venir", label: "À venir" },
  { value: "historique", label: "Historique" },
] as const;

function filterByTab(interventions: InterventionWithParties[], tab: string) {
  switch (tab) {
    case "attente":
      return interventions.filter((i) => i.status === "completed");
    case "historique":
      return interventions.filter((i) => ["validated", "cancelled"].includes(i.status));
    case "venir":
    default:
      return interventions.filter(
        (i) => !["completed", "validated", "cancelled"].includes(i.status),
      );
  }
}

export default async function MesInterventionsPage({
  searchParams,
}: {
  searchParams: Promise<{ vue?: string }>;
}) {
  const { vue } = await searchParams;
  const tab = TABS.some((t) => t.value === vue) ? vue! : "attente";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/connexion?suivant=/mes-interventions");
  }

  const interventions = await getMyInterventionsAsClient();
  const filtered = filterByTab(interventions, tab);
  const pendingCount = interventions.filter((i) => i.status === "completed").length;

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col gap-4 px-4 py-6">
      <h1 className="text-2xl font-bold text-brand-green-dark">
        Mes interventions
      </h1>

      <nav
        aria-label="Vues de mes interventions"
        className="flex gap-1 overflow-x-auto rounded-xl bg-white shadow-sm shadow-black/5 p-1"
      >
        {TABS.map((t) => (
          <Link
            key={t.value}
            href={`/mes-interventions?vue=${t.value}`}
            className={`relative flex-1 whitespace-nowrap rounded-lg px-3 py-2 text-center text-xs font-semibold ${
              tab === t.value
                ? "bg-brand-green-dark text-brand-cream"
                : "text-brand-ink/60"
            }`}
          >
            {t.label}
            {t.value === "attente" && pendingCount > 0 ? (
              <span className="ml-1 rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white">
                {pendingCount}
              </span>
            ) : null}
          </Link>
        ))}
      </nav>

      {filtered.length === 0 ? (
        <p className="rounded-xl bg-white shadow-sm shadow-black/5 p-6 text-center text-sm text-brand-ink/60">
          {tab === "attente"
            ? "Aucune intervention en attente de votre validation."
            : "Aucune intervention ici pour le moment."}
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((intervention) => (
            <InterventionCard
              key={intervention.id}
              intervention={intervention}
              viewerRole="client"
            />
          ))}
        </div>
      )}
    </div>
  );
}
