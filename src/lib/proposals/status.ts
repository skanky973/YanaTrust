export const PROPOSAL_STATUSES = [
  { value: "pending_client", label: "En attente du client", color: "bg-amber-100 text-amber-700" },
  {
    value: "modification_requested",
    label: "Modification demandée",
    color: "bg-indigo-100 text-indigo-700",
  },
  {
    value: "pending_provider",
    label: "En attente du prestataire",
    color: "bg-blue-100 text-blue-700",
  },
  {
    value: "confirmed",
    label: "Confirmée",
    color: "bg-brand-green-dark text-brand-cream",
  },
  { value: "refused", label: "Refusée", color: "bg-red-100 text-red-600" },
  { value: "cancelled", label: "Annulée", color: "bg-slate-100 text-slate-600" },
] as const;

export type ProposalStatus = (typeof PROPOSAL_STATUSES)[number]["value"];

const STATUS_BY_VALUE = new Map(PROPOSAL_STATUSES.map((s) => [s.value, s]));

export function getProposalStatusLabel(value: string): string {
  return STATUS_BY_VALUE.get(value as ProposalStatus)?.label ?? value;
}

export function getProposalStatusColor(value: string): string {
  return (
    STATUS_BY_VALUE.get(value as ProposalStatus)?.color ??
    "bg-brand-ink/10 text-brand-ink/70"
  );
}
