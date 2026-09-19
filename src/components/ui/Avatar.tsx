// Pastille d'identité, utilisée partout où une personne est citée. Sur une
// plateforme dont l'argument est la confiance, une carte sans visage ni
// repère visuel reste une ligne de texte anonyme.
//
// La photo prime quand elle existe ; les initiales servent de repli, pour les
// comptes créés avant que la photo soit demandée.

// Les tailles sont déclarées ici plutôt que surchargées au cas par cas via
// className : deux classes Tailwind concurrentes (h-9 et h-6) sont départagées
// par l'ordre dans la feuille de style, pas par l'ordre dans l'attribut, donc
// une surcharge locale ne s'applique pas de façon fiable.
const SIZES = {
  xs: "h-6 w-6 text-[9px]",
  sm: "h-9 w-9 text-[11px]",
  md: "h-12 w-12 text-sm",
  lg: "h-16 w-16 text-xl",
} as const;

function initials(firstName?: string | null, lastName?: string | null) {
  const value = `${firstName?.[0] ?? ""}${lastName?.[0] ?? ""}`.trim();
  return value ? value.toLocaleUpperCase("fr-FR") : "?";
}

export function Avatar({
  firstName,
  lastName,
  photoUrl,
  size = "md",
  className = "",
}: {
  firstName?: string | null;
  lastName?: string | null;
  photoUrl?: string | null;
  size?: keyof typeof SIZES;
  className?: string;
}) {
  if (photoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={photoUrl}
        alt=""
        className={`shrink-0 rounded-full object-cover ${SIZES[size]} ${className}`}
      />
    );
  }

  return (
    <span
      aria-hidden="true"
      className={`flex shrink-0 items-center justify-center rounded-full bg-brand-green-dark font-bold text-brand-cream ${SIZES[size]} ${className}`}
    >
      {initials(firstName, lastName)}
    </span>
  );
}
