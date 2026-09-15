import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getReports } from "@/lib/moderation/queries";
import { ReportRow } from "@/components/admin/ReportRow";

export const metadata: Metadata = {
  title: "Signalements — YanaTrust",
};

const TABS = [
  { value: "pending", label: "En attente" },
  { value: "reviewed", label: "Traités" },
  { value: "dismissed", label: "Rejetés" },
  { value: "tous", label: "Tous" },
];

export default async function SignalementsPage({
  searchParams,
}: {
  searchParams: Promise<{ statut?: string }>;
}) {
  const { statut } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/connexion?suivant=/admin/signalements");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) {
    redirect("/profil");
  }

  const activeTab = statut && TABS.some((t) => t.value === statut) ? statut : "pending";
  const reports = await getReports(activeTab === "tous" ? undefined : activeTab);

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-4 py-8">
      <h1 className="text-2xl font-bold text-brand-green-dark">Signalements</h1>

      <div className="flex gap-2 overflow-x-auto text-sm">
        {TABS.map((tab) => (
          <Link
            key={tab.value}
            href={`/admin/signalements?statut=${tab.value}`}
            className={`shrink-0 rounded-full px-3 py-1.5 font-medium ${
              activeTab === tab.value
                ? "bg-brand-green-dark text-brand-cream"
                : "bg-white text-brand-ink/70"
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {reports.length === 0 ? (
        <p className="rounded-xl bg-white shadow-sm shadow-black/5 p-6 text-center text-sm text-brand-ink/60">
          Aucun signalement ici.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {reports.map((report) => (
            <ReportRow key={report.id} report={report} />
          ))}
        </div>
      )}
    </div>
  );
}
