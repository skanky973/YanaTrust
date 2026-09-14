export const SERVICE_CATEGORIES = [
  { value: "menage", label: "Ménage" },
  { value: "bricolage", label: "Bricolage" },
  { value: "jardinage", label: "Jardinage" },
  { value: "demenagement", label: "Déménagement" },
  { value: "reparation", label: "Réparation" },
  { value: "beaute_bien_etre", label: "Beauté & bien-être" },
  { value: "cours_particuliers", label: "Cours particuliers" },
  { value: "transport", label: "Transport" },
  { value: "evenementiel", label: "Événementiel" },
  { value: "autre", label: "Autre" },
] as const;

export type ServiceCategory = (typeof SERVICE_CATEGORIES)[number]["value"];

const LABEL_BY_VALUE = new Map(
  SERVICE_CATEGORIES.map(({ value, label }) => [value, label]),
);

export function getCategoryLabel(value: string): string {
  return LABEL_BY_VALUE.get(value as ServiceCategory) ?? value;
}
