import "server-only";
import { createClient } from "@/lib/supabase/server";
import { computeTrustScore } from "@/lib/trust/score";
import type { Profile } from "@/lib/supabase/database.types";

export type RecommendedProvider = Profile & {
  averageRating: number | null;
  reviewCount: number;
  trustScore: number;
};

// "Recommandé" = classé par TrustScore décroissant, calculé à partir des
// vrais avis et vérifications — aucune valeur éditorialisée à la main.
export async function getRecommendedProviders(
  limit = 3,
): Promise<RecommendedProvider[]> {
  const supabase = await createClient();

  const { data: providers, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("is_provider", true)
    .order("created_at", { ascending: false })
    .limit(20);

  if (error || !providers || providers.length === 0) {
    if (error) console.error("getRecommendedProviders:", error.message);
    return [];
  }

  const providerIds = providers.map((p) => p.id);
  const { data: reviews } = await supabase
    .from("reviews")
    .select("provider_id, rating")
    .in("provider_id", providerIds);

  const ratingsByProvider = new Map<string, number[]>();
  for (const review of reviews ?? []) {
    const list = ratingsByProvider.get(review.provider_id) ?? [];
    list.push(review.rating);
    ratingsByProvider.set(review.provider_id, list);
  }

  const ranked = providers.map((provider) => {
    const ratings = ratingsByProvider.get(provider.id) ?? [];
    const averageRating =
      ratings.length > 0
        ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length
        : null;

    const trustScore = computeTrustScore({
      averageRating,
      reviewCount: ratings.length,
    });

    return { ...provider, averageRating, reviewCount: ratings.length, trustScore };
  });

  return ranked.sort((a, b) => b.trustScore - a.trustScore).slice(0, limit);
}
