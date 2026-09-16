"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createBookingCheckout } from "@/lib/actions/carpool";
import { INITIAL_ACTION_STATE } from "@/lib/actions/action-state";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { Alert } from "@/components/ui/Alert";

export function BookingForm({
  tripId,
  seatsAvailable,
  pricePerSeat,
}: {
  tripId: string;
  seatsAvailable: number;
  pricePerSeat: number;
}) {
  const [seats, setSeats] = useState(1);
  const [state, formAction] = useActionState(
    createBookingCheckout.bind(null, tripId),
    INITIAL_ACTION_STATE,
  );
  const router = useRouter();

  useEffect(() => {
    if (state.success && state.redirectTo) {
      router.push(state.redirectTo);
    }
  }, [state.success, state.redirectTo, router]);

  return (
    <form action={formAction} className="flex flex-col gap-3 rounded-xl bg-white shadow-sm shadow-black/5 p-4">
      {state.error ? <Alert>{state.error}</Alert> : null}

      <div className="flex flex-col gap-1.5">
        <label htmlFor="seats" className="text-sm font-medium text-brand-ink">
          Nombre de places
        </label>
        <select
          id="seats"
          name="seats"
          value={seats}
          onChange={(e) => setSeats(Number(e.target.value))}
          className="rounded-xl border border-brand-ink/15 bg-white px-4 py-3 text-base text-brand-ink focus:border-brand-green focus:outline-none focus:ring-2 focus:ring-brand-green/30"
        >
          {Array.from({ length: seatsAvailable }, (_, i) => i + 1).map((n) => (
            <option key={n} value={n}>
              {n} place{n > 1 ? "s" : ""}
            </option>
          ))}
        </select>
      </div>

      <p className="text-sm font-semibold text-brand-ink">
        Total : {(seats * pricePerSeat).toFixed(2)} €
      </p>

      <SubmitButton pendingLabel="Redirection vers le paiement...">
        Réserver et payer
      </SubmitButton>
    </form>
  );
}
