// Pastille d'initiales, utilisée partout où une personne est citée. Sur une
// plateforme dont l'argument est la confiance, une carte sans visage ni
// repère visuel reste une ligne de texte anonyme.

const SIZES = {
  sm: "h-9 w-9 text-[11px]",
  md: "h-12 w-12 text-sm",
} as const;

function initials(firstName?: string | null, lastName?: string | null) {
  const value = `${firstName?.[0] ?? ""}${lastName?.[0] ?? ""}`.trim();
  return value ? value.toLocaleUpperCase("fr-FR") : "?";
}

export function Avatar({
  firstName,
  lastName,
  size = "md",
  className = "",
}: {
  firstName?: string | null;
  lastName?: string | null;
  size?: keyof typeof SIZES;
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={`flex shrink-0 items-center justify-center rounded-full bg-brand-green-dark font-bold text-brand-cream ${SIZES[size]} ${className}`}
    >
      {initials(firstName, lastName)}
    </span>
  );
}
