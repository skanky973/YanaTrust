export const REQUEST_STATUSES = [
  { value: "draft", label: "Brouillon", color: "bg-slate-100 text-slate-600" },
  { value: "open", label: "Ouverte", color: "bg-brand-green/15 text-brand-green-dark" },
  { value: "in_discussion", label: "En discussion", color: "bg-amber-100 text-amber-700" },
  { value: "planning_in_progress", label: "Planification en cours", color: "bg-indigo-100 text-indigo-700" },
  { value: "confirmed", label: "Confirmée", color: "bg-brand-green-dark text-brand-cream" },
  { value: "in_progress", label: "En cours", color: "bg-brand-gold/25 text-brand-green-dark" },
  { value: "completed", label: "Terminée", color: "bg-teal-100 text-teal-700" },
  { value: "cancelled", label: "Annulée", color: "bg-red-100 text-red-600" },
] as const;

export type RequestStatus = (typeof REQUEST_STATUSES)[number]["value"];

const STATUS_BY_VALUE = new Map(REQUEST_STATUSES.map((s) => [s.value, s]));

export function getStatusLabel(value: string): string {
  return STATUS_BY_VALUE.get(value as RequestStatus)?.label ?? value;
}

export function getStatusColor(value: string): string {
  return STATUS_BY_VALUE.get(value as RequestStatus)?.color ?? "bg-brand-ink/10 text-brand-ink/60";
}
