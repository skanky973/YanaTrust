// Score de confiance sur 100, calculé à partir de signaux réels.
//
// Le barème précédent accordait 15 points pour un téléphone vérifié et 15 pour
// une identité vérifiée. Or aucune de ces deux vérifications n'existe : les
// colonnes correspondantes sont lues partout et écrites nulle part, et leur
// trigger interdit à l'utilisateur de les modifier lui-même. Le maximum réel
// était donc 70/100, alors que le seuil du niveau "Élevé" est à 80 : personne
// ne pouvait l'atteindre, et le score affiché promettait une vérification qui
// n'avait jamais lieu.
//
// Le barème ne compte plus que ce qui existe vraiment, et redevient atteignable :
//   - Note moyenne (sur 5)        -> jusqu'à 70 points
//   - Nombre d'avis (expérience)  -> jusqu'à 30 points (3 pts/avis, plafonné)
//
// Quand la vérification du téléphone sera réellement implémentée, elle reprendra
// sa place dans ce calcul — mais pas avant.
export function computeTrustScore({
  averageRating,
  reviewCount,
}: {
  averageRating: number | null;
  reviewCount: number;
}): number {
  const ratingPoints = averageRating !== null ? (averageRating / 5) * 70 : 0;
  const experiencePoints = Math.min(reviewCount * 3, 30);

  return Math.round(Math.min(ratingPoints + experiencePoints, 100));
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
