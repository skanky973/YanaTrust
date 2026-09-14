import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Review } from "@/lib/supabase/database.types";

export type ReviewWithAuthor = Review & {
  author: { first_name: string; last_name: string } | null;
};

export type RatingSummary = { average: number | null; count: number };

export async function getProviderRatingSummary(
  providerId: string,
): Promise<RatingSummary> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("reviews")
    .select("rating")
    .eq("provider_id", providerId);

  if (error || !data || data.length === 0) {
    if (error) console.error("getProviderRatingSummary:", error.message);
    return { average: null, count: 0 };
  }

  const sum = data.reduce((total, r) => total + r.rating, 0);
  return { average: sum / data.length, count: data.length };
}

export async function getProviderReviews(
  providerId: string,
): Promise<ReviewWithAuthor[]> {
  const supabase = await createClient();

  const { data: reviews, error } = await supabase
    .from("reviews")
    .select("*")
    .eq("provider_id", providerId)
    .order("created_at", { ascending: false });

  if (error || !reviews) {
    if (error) console.error("getProviderReviews:", error.message);
    return [];
  }

  const authorIds = [...new Set(reviews.map((r) => r.author_id))];
  const { data: authors } = await supabase
    .from("profiles")
    .select("id, first_name, last_name")
    .in("id", authorIds);

  const authorById = new Map((authors ?? []).map((a) => [a.id, a]));

  return reviews.map((review) => ({
    ...review,
    author: authorById.get(review.author_id) ?? null,
  }));
}

export async function getMyReviewFor(providerId: string): Promise<Review | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data } = await supabase
    .from("reviews")
    .select("*")
    .eq("provider_id", providerId)
    .eq("author_id", user.id)
    .maybeSingle();

  return data;
}
