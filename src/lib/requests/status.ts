export const REQUEST_STATUSES = [
  { value: "open", label: "Ouverte" },
  { value: "in_discussion", label: "En discussion" },
  { value: "completed", label: "Terminée" },
  { value: "cancelled", label: "Annulée" },
] as const;

export type RequestStatus = (typeof REQUEST_STATUSES)[number]["value"];

const LABEL_BY_VALUE = new Map(
  REQUEST_STATUSES.map(({ value, label }) => [value, label]),
);

export function getStatusLabel(value: string): string {
  return LABEL_BY_VALUE.get(value as RequestStatus) ?? value;
}
