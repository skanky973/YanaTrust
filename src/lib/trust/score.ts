// Calcule un score de confiance /100 à partir de signaux réels (pas de valeur
// inventée) : note moyenne des avis, nombre d'avis, vérifications du profil.
//   - Note moyenne (sur 5) -> jusqu'à 60 points
//   - Téléphone vérifié -> +15
//   - Identité vérifiée -> +15
//   - Ancienneté en avis (expérience) -> jusqu'à 10 points (2 pts/avis, plafonné)
export function computeTrustScore({
  averageRating,
  reviewCount,
  phoneVerified,
  identityVerified,
}: {
  averageRating: number | null;
  reviewCount: number;
  phoneVerified: boolean;
  identityVerified: boolean;
}): number {
  const ratingPoints = averageRating !== null ? (averageRating / 5) * 60 : 0;
  const verificationPoints = (phoneVerified ? 15 : 0) + (identityVerified ? 15 : 0);
  const experiencePoints = Math.min(reviewCount * 2, 10);

  return Math.round(
    Math.min(ratingPoints + verificationPoints + experiencePoints, 100),
  );
}

export type TrustLevel = "eleve" | "moyen" | "debutant";

export function getTrustLevel(score: number): {
  level: TrustLevel;
  label: string;
} {
  if (score >= 80) return { level: "eleve", label: "Élevé" };
  if (score >= 50) return { level: "moyen", label: "Moyen" };
  return { level: "debutant", label: "Débutant" };
}
