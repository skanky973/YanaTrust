import "server-only";
import { getProviderRatingSummary } from "@/lib/reviews/queries";
import { computeTrustScore } from "@/lib/trust/score";

export async function getProviderTrustScore(providerId: string): Promise<number> {
  // Le profil n'est plus interrogé : les seules colonnes qu'on y lisait
  // (phone_verified, identity_verified) ne sont jamais renseignées, faute de
  // procédure de vérification. Voir le commentaire de computeTrustScore.
  const ratingSummary = await getProviderRatingSummary(providerId);

  return computeTrustScore({
    averageRating: ratingSummary.average,
    reviewCount: ratingSummary.count,
  });
}
