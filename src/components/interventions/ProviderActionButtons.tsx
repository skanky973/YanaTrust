import Link from "next/link";
import {
  acceptIntervention,
  refuseIntervention,
  markOnTheWay,
  startIntervention,
} from "@/lib/actions/interventions";
import { Button, LinkButton } from "@/components/ui/Button";
import { CancelInterventionButton } from "@/components/interventions/CancelInterventionButton";

export function ProviderActionButtons({
  interventionId,
  status,
}: {
  interventionId: string;
  status: string;
}) {
  const showAccept = status === "new_request" || status === "pending_confirmation";
  const showOnTheWay = status === "confirmed" || status === "scheduled";
  const showStart = status === "on_the_way";
  const showFinish = status === "in_progress";
  const showCancel = !["completed", "validated", "cancelled"].includes(status);

  if (!showAccept && !showOnTheWay && !showStart && !showFinish && !showCancel) {
    return null;
  }

  return (
    <div className="flex flex-col gap-2">
      {showAccept ? (
        <div className="flex gap-2">
          <form action={acceptIntervention.bind(null, interventionId)} className="flex-1">
            <Button type="submit" variant="primary" className="w-full">
              Accepter la demande
            </Button>
          </form>
          <form action={refuseIntervention.bind(null, interventionId)} className="flex-1">
            <Button type="submit" variant="ghost" className="w-full">
              Refuser
            </Button>
          </form>
        </div>
      ) : null}

      {showOnTheWay ? (
        <form action={markOnTheWay.bind(null, interventionId)}>
          <Button type="submit" variant="primary" className="w-full">
            Je suis en route
          </Button>
        </form>
      ) : null}

      {showStart ? (
        <form action={startIntervention.bind(null, interventionId)}>
          <Button type="submit" variant="primary" className="w-full">
            Commencer l&rsquo;intervention
          </Button>
        </form>
      ) : null}

      {showFinish ? (
        <LinkButton href={`/planning/${interventionId}/terminer`} variant="primary" className="w-full">
          Terminer l&rsquo;intervention
        </LinkButton>
      ) : null}

      {showCancel ? (
        <CancelInterventionButton interventionId={interventionId} />
      ) : null}

      <Link
        href={`/planning/${interventionId}/reprogrammer`}
        className="text-center text-sm font-semibold text-brand-green-dark"
      >
        Reprogrammer
      </Link>
    </div>
  );
}
