"use client";

import { deleteUnavailableDate } from "@/lib/actions/availability";

export function DeleteUnavailableDateButton({ dateId }: { dateId: string }) {
  return (
    <form action={deleteUnavailableDate.bind(null, dateId)}>
      <button
        type="submit"
        aria-label="Retirer cette indisponibilité"
        className="text-xs font-semibold text-red-600"
      >
        Retirer
      </button>
    </form>
  );
}
