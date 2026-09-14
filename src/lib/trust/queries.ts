import "server-only";
import { createClient } from "@/lib/supabase/server";
import { getProviderRatingSummary } from "@/lib/reviews/queries";
import { computeTrustScore } from "@/lib/trust/score";

export async function getProviderTrustScore(providerId: string): Promise<number> {
  const supabase = await createClient();

  const [{ data: profile }, ratingSummary] = await Promise.all([
    supabase
      .from("profiles")
      .select("phone_verified, identity_verified")
      .eq("id", providerId)
      .single(),
    getProviderRatingSummary(providerId),
  ]);

  return computeTrustScore({
    averageRating: ratingSummary.average,
    reviewCount: ratingSummary.count,
    phoneVerified: profile?.phone_verified ?? false,
    identityVerified: profile?.identity_verified ?? false,
  });
}
