"use client";

import { cancelIntervention } from "@/lib/actions/interventions";
import { Button } from "@/components/ui/Button";

export function CancelInterventionButton({
  interventionId,
}: {
  interventionId: string;
}) {
  return (
    <form
      action={cancelIntervention.bind(null, interventionId)}
      onSubmit={(e) => {
        if (!confirm("Annuler cette intervention ?")) {
          e.preventDefault();
        }
      }}
    >
      <Button type="submit" variant="ghost" className="w-full text-red-600">
        Annuler l&rsquo;intervention
      </Button>
    </form>
  );
}
