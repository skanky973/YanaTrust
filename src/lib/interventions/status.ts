export const INTERVENTION_STATUSES = [
  { value: "new_request", label: "Nouvelle demande", color: "bg-slate-100 text-slate-600" },
  { value: "pending_confirmation", label: "En attente de confirmation", color: "bg-amber-100 text-amber-700" },
  { value: "confirmed", label: "Confirmée", color: "bg-brand-green/15 text-brand-green-dark" },
  { value: "scheduled", label: "Planifiée", color: "bg-blue-100 text-blue-700" },
  { value: "on_the_way", label: "En route", color: "bg-indigo-100 text-indigo-700" },
  { value: "in_progress", label: "Intervention en cours", color: "bg-brand-gold/25 text-brand-green-dark" },
  { value: "completed", label: "Terminée", color: "bg-teal-100 text-teal-700" },
  { value: "validated", label: "Validée par le client", color: "bg-brand-green-dark text-brand-cream" },
  { value: "cancelled", label: "Annulée", color: "bg-red-100 text-red-600" },
] as const;

export type InterventionStatus = (typeof INTERVENTION_STATUSES)[number]["value"];

const STATUS_BY_VALUE = new Map(INTERVENTION_STATUSES.map((s) => [s.value, s]));

export function getStatusLabel(value: string): string {
  return STATUS_BY_VALUE.get(value as InterventionStatus)?.label ?? value;
}

export function getStatusColor(value: string): string {
  return STATUS_BY_VALUE.get(value as InterventionStatus)?.color ?? "bg-brand-ink/10 text-brand-ink/60";
}

const ACTIVE_STATUSES: InterventionStatus[] = [
  "new_request",
  "pending_confirmation",
  "confirmed",
  "scheduled",
  "on_the_way",
  "in_progress",
];

export function isActiveStatus(status: string): boolean {
  return ACTIVE_STATUSES.includes(status as InterventionStatus);
}

export function isAwaitingProviderAction(status: string): boolean {
  return status === "new_request" || status === "pending_confirmation";
}
