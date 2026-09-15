import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  getMonthGrid,
  toISODate,
  WEEKDAY_LABELS,
  MONTH_LABELS,
} from "@/lib/interventions/calendar-utils";
import type { InterventionWithParties } from "@/lib/interventions/queries";

export function MonthCalendar({
  interventions,
  year,
  month,
  selectedDate,
}: {
  interventions: InterventionWithParties[];
  year: number;
  month: number;
  selectedDate?: string;
}) {
  const weeks = getMonthGrid(year, month);
  const countByDate = new Map<string, number>();
  for (const i of interventions) {
    if (i.status === "cancelled") continue;
    countByDate.set(i.scheduled_date, (countByDate.get(i.scheduled_date) ?? 0) + 1);
  }

  const todayStr = toISODate(new Date());
  const prevMonth = month === 0 ? { y: year - 1, m: 11 } : { y: year, m: month - 1 };
  const nextMonth = month === 11 ? { y: year + 1, m: 0 } : { y: year, m: month + 1 };

  return (
    <div className="rounded-xl bg-white shadow-sm shadow-black/5 p-3">
      <div className="mb-2 flex items-center justify-between">
        <Link
          href={`/planning?vue=planning&affichage=mois&mois=${prevMonth.y}-${String(prevMonth.m + 1).padStart(2, "0")}`}
          className="p-1 text-brand-ink/60"
          aria-label="Mois précédent"
        >
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <p className="text-sm font-semibold text-brand-ink">
          {MONTH_LABELS[month]} {year}
        </p>
        <Link
          href={`/planning?vue=planning&affichage=mois&mois=${nextMonth.y}-${String(nextMonth.m + 1).padStart(2, "0")}`}
          className="p-1 text-brand-ink/60"
          aria-label="Mois suivant"
        >
          <ChevronRight className="h-5 w-5" />
        </Link>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-semibold text-brand-ink/40">
        {WEEKDAY_LABELS.map((d, i) => (
          <span key={i}>{d}</span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {weeks.flat().map((date, i) => {
          const dateStr = toISODate(date);
          const inMonth = date.getMonth() === month;
          const count = countByDate.get(dateStr) ?? 0;
          const isToday = dateStr === todayStr;
          const isSelected = dateStr === selectedDate;

          return (
            <Link
              key={i}
              href={`/planning?vue=planning&affichage=liste&date=${dateStr}`}
              className={`flex flex-col items-center gap-0.5 rounded-lg py-1.5 text-xs ${
                !inMonth
                  ? "text-brand-ink/25"
                  : isSelected
                    ? "bg-brand-green-dark text-brand-cream"
                    : isToday
                      ? "bg-brand-gold/25 text-brand-ink"
                      : "text-brand-ink"
              }`}
            >
              {date.getDate()}
              {count > 0 ? (
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    isSelected ? "bg-brand-cream" : "bg-brand-green"
                  }`}
                />
              ) : (
                <span className="h-1.5 w-1.5" />
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
