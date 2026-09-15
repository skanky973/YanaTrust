import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  getMyWeeklyAvailability,
  getMyUnavailableDates,
} from "@/lib/availability/queries";
import { getDayLabel } from "@/lib/availability/days";
import { WeeklySlotForm } from "@/components/availability/WeeklySlotForm";
import { UnavailableDateForm } from "@/components/availability/UnavailableDateForm";
import { DeleteSlotButton } from "@/components/availability/DeleteSlotButton";
import { DeleteUnavailableDateButton } from "@/components/availability/DeleteUnavailableDateButton";

export const metadata: Metadata = {
  title: "Mes disponibilités — YanaTrust",
};

function formatDate(dateStr: string) {
  return new Date(`${dateStr}T00:00:00`).toLocaleDateString("fr-FR", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

export default async function DisponibilitesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/connexion?suivant=/planning/disponibilites");
  }

  const [slots, unavailableDates] = await Promise.all([
    getMyWeeklyAvailability(),
    getMyUnavailableDates(),
  ]);

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-4 py-8">
      <h1 className="text-2xl font-bold text-brand-green-dark">
        Mes disponibilités
      </h1>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-brand-ink/70">
          Horaires habituels
        </h2>

        {slots.length === 0 ? (
          <p className="rounded-xl bg-white shadow-sm shadow-black/5 p-4 text-center text-sm text-brand-ink/60">
            Aucun horaire défini pour le moment.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {slots.map((slot) => (
              <div
                key={slot.id}
                className="flex items-center justify-between rounded-xl bg-white shadow-sm shadow-black/5 p-3"
              >
                <span className="text-sm text-brand-ink">
                  <span className="font-medium">{getDayLabel(slot.day_of_week)}</span>{" "}
                  {slot.start_time.slice(0, 5)} – {slot.end_time.slice(0, 5)}
                </span>
                <DeleteSlotButton slotId={slot.id} />
              </div>
            ))}
          </div>
        )}

        <div className="rounded-xl bg-white shadow-sm shadow-black/5 p-4">
          <WeeklySlotForm />
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-brand-ink/70">
          Jours indisponibles
        </h2>

        {unavailableDates.length === 0 ? (
          <p className="rounded-xl bg-white shadow-sm shadow-black/5 p-4 text-center text-sm text-brand-ink/60">
            Aucun jour bloqué à venir.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {unavailableDates.map((d) => (
              <div
                key={d.id}
                className="flex items-center justify-between rounded-xl bg-white shadow-sm shadow-black/5 p-3"
              >
                <span className="text-sm text-brand-ink">
                  <span className="font-medium">{formatDate(d.date)}</span>
                  {d.reason ? ` — ${d.reason}` : ""}
                </span>
                <DeleteUnavailableDateButton dateId={d.id} />
              </div>
            ))}
          </div>
        )}

        <div className="rounded-xl bg-white shadow-sm shadow-black/5 p-4">
          <UnavailableDateForm />
        </div>
      </section>
    </div>
  );
}
