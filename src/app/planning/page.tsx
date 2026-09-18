import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Bell, CalendarClock } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import {
  getMyInterventionsAsProvider,
  getProviderDashboardStats,
} from "@/lib/interventions/queries";
import { getUnreadNotificationCount } from "@/lib/notifications/queries";
import { SERVICE_CATEGORIES } from "@/lib/services/categories";
import { InterventionCard } from "@/components/interventions/InterventionCard";
import { MonthCalendar } from "@/components/interventions/MonthCalendar";
import { WeekCalendar } from "@/components/interventions/WeekCalendar";
import { LinkButton } from "@/components/ui/Button";
import { parseISODate } from "@/lib/interventions/calendar-utils";
import type { InterventionWithParties } from "@/lib/interventions/queries";

export const metadata: Metadata = {
  title: "Mon planning — YanaTrust",
};

const TABS = [
  { value: "aujourdhui", label: "Aujourd'hui" },
  { value: "planning", label: "Planning" },
  { value: "demandes", label: "Demandes" },
  { value: "historique", label: "Historique" },
] as const;

const VIEWS = [
  { value: "liste", label: "Liste" },
  { value: "semaine", label: "Semaine" },
  { value: "mois", label: "Mois" },
] as const;

function filterByTab(
  interventions: InterventionWithParties[],
  tab: string,
  todayStr: string,
) {
  switch (tab) {
    case "aujourdhui":
      return interventions.filter(
        (i) => i.scheduled_date === todayStr && i.status !== "cancelled",
      );
    case "demandes":
      return interventions.filter(
        (i) => i.status === "new_request" || i.status === "pending_confirmation",
      );
    case "historique":
      return interventions.filter((i) =>
        ["completed", "validated", "cancelled"].includes(i.status),
      );
    case "planning":
    default:
      return interventions.filter(
        (i) => !["completed", "validated", "cancelled"].includes(i.status),
      );
  }
}

export default async function PlanningPage({
  searchParams,
}: {
  searchParams: Promise<{
    vue?: string;
    affichage?: string;
    statut?: string;
    categorie?: string;
    q?: string;
    date?: string;
    mois?: string;
    semaine?: string;
  }>;
}) {
  const { vue, affichage, statut, categorie, q, date, mois, semaine } =
    await searchParams;
  const tab = TABS.some((t) => t.value === vue) ? vue! : "planning";
  const view = VIEWS.some((v) => v.value === affichage) ? affichage! : "liste";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/connexion?suivant=/planning");
  }

  const [interventions, allInterventions, stats, unreadCount] = await Promise.all([
    getMyInterventionsAsProvider({
      status: statut,
      category: categorie,
      search: q,
      date: tab === "planning" && view === "liste" ? date : undefined,
    }),
    tab === "planning" && view !== "liste"
      ? getMyInterventionsAsProvider({})
      : Promise.resolve<InterventionWithParties[]>([]),
    getProviderDashboardStats(),
    getUnreadNotificationCount(),
  ]);

  const todayStr = new Date().toISOString().slice(0, 10);
  const filtered = filterByTab(interventions, tab, todayStr);

  const now = new Date();
  const [monthYear, monthMonth] = mois
    ? mois.split("-").map(Number)
    : [now.getFullYear(), now.getMonth() + 1];
  const weekReference = semaine ? parseISODate(semaine) : now;

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col gap-4 px-4 py-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-brand-green-dark">
          Mon planning
        </h1>
        <div className="flex items-center gap-2">
          <Link
            href="/planning/disponibilites"
            className="p-2 text-brand-ink/70"
            aria-label="Mes disponibilités"
          >
            <CalendarClock className="h-5 w-5" aria-hidden="true" />
          </Link>
          <Link href="/notifications" className="relative p-2" aria-label="Notifications">
            <Bell className="h-5 w-5 text-brand-ink/70" aria-hidden="true" />
            {unreadCount > 0 ? (
              <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            ) : null}
          </Link>
          <LinkButton
            href="/planning/nouveau"
            variant="primary"
            className="px-3 py-2 text-xs"
          >
            + Ajouter
          </LinkButton>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-xl bg-white shadow-sm shadow-black/5 p-3">
          <p className="text-2xl font-bold text-brand-green-dark">{stats.todayCount}</p>
          <p className="text-xs text-brand-ink/70">aujourd&rsquo;hui</p>
        </div>
        <div className="rounded-xl bg-white shadow-sm shadow-black/5 p-3">
          <p className="text-2xl font-bold text-brand-green-dark">
            {stats.pendingConfirmationCount}
          </p>
          <p className="text-xs text-brand-ink/70">en attente de confirmation</p>
        </div>
        <div className="rounded-xl bg-white shadow-sm shadow-black/5 p-3">
          <p className="text-2xl font-bold text-brand-green-dark">
            {stats.pendingValidationCount}
          </p>
          <p className="text-xs text-brand-ink/70">en attente de validation</p>
        </div>
        <div className="rounded-xl bg-white shadow-sm shadow-black/5 p-3">
          <p className="text-2xl font-bold text-brand-green-dark">
            {stats.estimatedRevenueThisMonth.toFixed(0)} €
          </p>
          <p className="text-xs text-brand-ink/70">estimé ce mois-ci</p>
        </div>
      </div>

      {stats.nextIntervention ? (
        <Link
          href={`/planning/${stats.nextIntervention.id}`}
          className="rounded-xl bg-brand-green-dark p-4 text-brand-cream"
        >
          <p className="text-xs font-semibold text-brand-cream/70">
            Prochaine intervention
          </p>
          <p className="mt-0.5 font-semibold">{stats.nextIntervention.title}</p>
          <p className="text-sm text-brand-cream/80">
            {new Date(`${stats.nextIntervention.scheduled_date}T00:00:00`).toLocaleDateString(
              "fr-FR",
              { weekday: "long", day: "numeric", month: "long" },
            )}{" "}
            à {stats.nextIntervention.start_time.slice(0, 5)}
          </p>
        </Link>
      ) : null}

      <nav
        aria-label="Vues du planning"
        className="flex gap-1 overflow-x-auto rounded-xl bg-white shadow-sm shadow-black/5 p-1"
      >
        {TABS.map((t) => (
          <Link
            key={t.value}
            href={`/planning?vue=${t.value}`}
            className={`flex-1 whitespace-nowrap rounded-lg px-3 py-2 text-center text-xs font-semibold ${
              tab === t.value
                ? "bg-brand-green-dark text-brand-cream"
                : "text-brand-ink/70"
            }`}
          >
            {t.label}
          </Link>
        ))}
      </nav>

      {tab === "planning" ? (
        <nav
          aria-label="Type d'affichage"
          className="flex gap-1 rounded-xl bg-white shadow-sm shadow-black/5 p-1"
        >
          {VIEWS.map((v) => (
            <Link
              key={v.value}
              href={`/planning?vue=planning&affichage=${v.value}`}
              className={`flex-1 whitespace-nowrap rounded-lg px-3 py-1.5 text-center text-xs font-medium ${
                view === v.value
                  ? "bg-brand-green/15 text-brand-green-dark"
                  : "text-brand-ink/65"
              }`}
            >
              {v.label}
            </Link>
          ))}
        </nav>
      ) : null}

      {tab === "planning" && view === "mois" ? (
        <MonthCalendar
          interventions={allInterventions}
          year={monthYear}
          month={monthMonth - 1}
          selectedDate={date}
        />
      ) : tab === "planning" && view === "semaine" ? (
        <WeekCalendar interventions={allInterventions} referenceDate={weekReference} />
      ) : (
        <>
          <form className="flex flex-col gap-2" method="get">
            <input type="hidden" name="vue" value={tab} />
            {view !== "liste" ? <input type="hidden" name="affichage" value={view} /> : null}
            <input
              type="search"
              name="q"
              defaultValue={q}
              placeholder="Rechercher une intervention..."
              className="rounded-xl border border-brand-ink/15 bg-white px-4 py-2.5 text-sm text-brand-ink placeholder:text-brand-ink/65 focus:border-brand-green focus:outline-none focus:ring-2 focus:ring-brand-green/30"
            />
            <div className="grid grid-cols-2 gap-2">
              <select
                name="categorie"
                defaultValue={categorie ?? ""}
                className="rounded-xl border border-brand-ink/15 bg-white px-3 py-2.5 text-sm text-brand-ink focus:border-brand-green focus:outline-none focus:ring-2 focus:ring-brand-green/30"
              >
                <option value="">Toutes catégories</option>
                {SERVICE_CATEGORIES.map(({ value, label }) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
              <button
                type="submit"
                className="rounded-xl bg-brand-green-dark px-3 py-2.5 text-sm font-semibold text-brand-cream"
              >
                Filtrer
              </button>
            </div>
          </form>

          {date && tab === "planning" ? (
            <div className="flex items-center justify-between rounded-xl bg-brand-green/10 px-4 py-2 text-sm">
              <span className="text-brand-green-dark">
                Filtré sur le {new Date(`${date}T00:00:00`).toLocaleDateString("fr-FR")}
              </span>
              <Link href="/planning?vue=planning" className="font-semibold text-brand-green-dark">
                Effacer
              </Link>
            </div>
          ) : null}

          {filtered.length === 0 ? (
            <p className="rounded-xl bg-white shadow-sm shadow-black/5 p-6 text-center text-sm text-brand-ink/70">
              Aucune intervention ici pour le moment.
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {filtered.map((intervention) => (
                <InterventionCard key={intervention.id} intervention={intervention} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
