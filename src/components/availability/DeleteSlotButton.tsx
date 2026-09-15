"use client";

import { deleteWeeklySlot } from "@/lib/actions/availability";

export function DeleteSlotButton({ slotId }: { slotId: string }) {
  return (
    <form action={deleteWeeklySlot.bind(null, slotId)}>
      <button
        type="submit"
        aria-label="Supprimer ce créneau"
        className="text-xs font-semibold text-red-600"
      >
        Supprimer
      </button>
    </form>
  );
}
