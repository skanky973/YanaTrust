"use client";

import { useActionState } from "react";
import { addWeeklySlot } from "@/lib/actions/availability";
import { INITIAL_ACTION_STATE } from "@/lib/actions/action-state";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { Alert } from "@/components/ui/Alert";
import { DAYS_OF_WEEK } from "@/lib/availability/days";

export function WeeklySlotForm() {
  const [state, formAction] = useActionState(addWeeklySlot, INITIAL_ACTION_STATE);

  return (
    <form action={formAction} className="flex flex-col gap-3">
      {state.error ? <Alert>{state.error}</Alert> : null}

      <select
        name="dayOfWeek"
        defaultValue="1"
        className="rounded-xl border border-brand-ink/15 bg-white px-4 py-3 text-base text-brand-ink focus:border-brand-green focus:outline-none focus:ring-2 focus:ring-brand-green/30"
      >
        {DAYS_OF_WEEK.map((d) => (
          <option key={d.value} value={d.value}>
            {d.label}
          </option>
        ))}
      </select>

      <div className="grid grid-cols-2 gap-3">
        <input
          type="time"
          name="startTime"
          required
          defaultValue="08:00"
          className="rounded-xl border border-brand-ink/15 bg-white px-4 py-3 text-base text-brand-ink focus:border-brand-green focus:outline-none focus:ring-2 focus:ring-brand-green/30"
        />
        <input
          type="time"
          name="endTime"
          required
          defaultValue="18:00"
          className="rounded-xl border border-brand-ink/15 bg-white px-4 py-3 text-base text-brand-ink focus:border-brand-green focus:outline-none focus:ring-2 focus:ring-brand-green/30"
        />
      </div>

      <SubmitButton pendingLabel="Ajout...">Ajouter ce créneau</SubmitButton>
    </form>
  );
}
