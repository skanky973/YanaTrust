export const APPLICATION_STATUSES = [
  { value: "pending", label: "En attente", color: "bg-amber-100 text-amber-700" },
  {
    value: "accepted_for_discussion",
    label: "Acceptée pour discussion",
    color: "bg-brand-green/15 text-brand-green-dark",
  },
  { value: "refused", label: "Refusée", color: "bg-red-100 text-red-600" },
  { value: "not_retained", label: "Non retenue", color: "bg-slate-100 text-slate-600" },
] as const;

export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number]["value"];

const STATUS_BY_VALUE = new Map(APPLICATION_STATUSES.map((s) => [s.value, s]));

export function getApplicationStatusLabel(value: string): string {
  return STATUS_BY_VALUE.get(value as ApplicationStatus)?.label ?? value;
}

export function getApplicationStatusColor(value: string): string {
  return (
    STATUS_BY_VALUE.get(value as ApplicationStatus)?.color ??
    "bg-brand-ink/10 text-brand-ink/60"
  );
}
