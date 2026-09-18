import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  getWeekDates,
  toISODate,
  WEEKDAY_FULL_LABELS,
} from "@/lib/interventions/calendar-utils";
import { InterventionCard } from "@/components/interventions/InterventionCard";
import type { InterventionWithParties } from "@/lib/interventions/queries";

export function WeekCalendar({
  interventions,
  referenceDate,
}: {
  interventions: InterventionWithParties[];
  referenceDate: Date;
}) {
  const days = getWeekDates(referenceDate);
  const byDate = new Map<string, InterventionWithParties[]>();
  for (const i of interventions) {
    if (i.status === "cancelled") continue;
    const list = byDate.get(i.scheduled_date) ?? [];
    list.push(i);
    byDate.set(i.scheduled_date, list);
  }

  const prevWeek = new Date(referenceDate);
  prevWeek.setDate(prevWeek.getDate() - 7);
  const nextWeek = new Date(referenceDate);
  nextWeek.setDate(nextWeek.getDate() + 7);

  const todayStr = toISODate(new Date());

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between rounded-xl bg-white shadow-sm shadow-black/5 p-3">
        <Link
          href={`/planning?vue=planning&affichage=semaine&semaine=${toISODate(prevWeek)}`}
          className="p-1 text-brand-ink/70"
          aria-label="Semaine précédente"
        >
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <p className="text-sm font-semibold text-brand-ink">
          {toISODate(days[0])} — {toISODate(days[6])}
        </p>
        <Link
          href={`/planning?vue=planning&affichage=semaine&semaine=${toISODate(nextWeek)}`}
          className="p-1 text-brand-ink/70"
          aria-label="Semaine suivante"
        >
          <ChevronRight className="h-5 w-5" />
        </Link>
      </div>

      {days.map((date, i) => {
        const dateStr = toISODate(date);
        const dayInterventions = byDate.get(dateStr) ?? [];

        return (
          <div key={dateStr}>
            <p
              className={`mb-1.5 text-xs font-semibold ${
                dateStr === todayStr ? "text-brand-green-dark" : "text-brand-ink/65"
              }`}
            >
              {WEEKDAY_FULL_LABELS[i]} {date.getDate()}
              {dateStr === todayStr ? " · aujourd'hui" : ""}
            </p>
            {dayInterventions.length === 0 ? (
              <p className="rounded-xl bg-white shadow-sm shadow-black/5 px-4 py-2.5 text-xs text-brand-ink/65">
                Rien de prévu
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                {dayInterventions.map((intervention) => (
                  <InterventionCard key={intervention.id} intervention={intervention} />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
