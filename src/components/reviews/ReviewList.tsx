import type { ReviewWithAuthor } from "@/lib/reviews/queries";

export function ReviewList({ reviews }: { reviews: ReviewWithAuthor[] }) {
  if (reviews.length === 0) {
    return (
      <p className="rounded-xl bg-white shadow-sm shadow-black/5 p-4 text-center text-sm text-brand-ink/50">
        Aucun avis pour le moment.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {reviews.map((review) => (
        <div key={review.id} className="rounded-xl bg-white shadow-sm shadow-black/5 p-4">
          <div className="flex items-center justify-between">
            <p className="font-semibold text-brand-ink">
              {review.author
                ? `${review.author.first_name} ${review.author.last_name}`
                : "Utilisateur"}
            </p>
            <span className="text-sm font-semibold text-brand-ink">
              ★ {review.rating}/5
            </span>
          </div>
          {review.comment ? (
            <p className="mt-2 text-sm text-brand-ink/80">{review.comment}</p>
          ) : null}
          <p className="mt-2 text-xs text-brand-ink/40">
            {new Date(review.created_at).toLocaleDateString("fr-FR")}
          </p>
        </div>
      ))}
    </div>
  );
}
