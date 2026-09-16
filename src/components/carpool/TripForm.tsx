"use client";

import { useActionState } from "react";
import { publishTrip } from "@/lib/actions/carpool";
import { INITIAL_ACTION_STATE } from "@/lib/actions/action-state";
import { TextField } from "@/components/ui/TextField";
import { TextAreaField } from "@/components/ui/TextAreaField";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { Alert } from "@/components/ui/Alert";

export function TripForm() {
  const [state, formAction] = useActionState(publishTrip, INITIAL_ACTION_STATE);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {state.error ? <Alert>{state.error}</Alert> : null}

      <div className="grid grid-cols-2 gap-3">
        <TextField
          label="Ville de départ"
          name="originCity"
          placeholder="Saint-Laurent-du-Maroni"
          error={state.fieldErrors?.originCity?.[0]}
          required
        />
        <TextField
          label="Ville d'arrivée"
          name="destinationCity"
          placeholder="Cayenne"
          error={state.fieldErrors?.destinationCity?.[0]}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <TextField
          label="Date de départ"
          name="departureDate"
          type="date"
          error={state.fieldErrors?.departureDate?.[0]}
          required
        />
        <TextField
          label="Heure"
          name="departureTime"
          type="time"
          error={state.fieldErrors?.departureTime?.[0]}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <TextField
          label="Places disponibles"
          name="seatsTotal"
          type="number"
          min="1"
          max="8"
          defaultValue="3"
          error={state.fieldErrors?.seatsTotal?.[0]}
          required
        />
        <TextField
          label="Prix par place (€)"
          name="pricePerSeat"
          type="number"
          min="0"
          step="0.5"
          error={state.fieldErrors?.pricePerSeat?.[0]}
          required
        />
      </div>

      <TextAreaField
        label="Informations complémentaires (facultatif)"
        name="description"
        placeholder="Point de rendez-vous précis, bagages, animaux..."
        error={state.fieldErrors?.description?.[0]}
      />

      <SubmitButton pendingLabel="Publication...">Publier le trajet</SubmitButton>
    </form>
  );
}
