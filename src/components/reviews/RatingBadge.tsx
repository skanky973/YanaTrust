import type { RatingSummary } from "@/lib/reviews/queries";

export function RatingBadge({ summary }: { summary: RatingSummary }) {
  if (summary.count === 0) {
    return <span className="text-xs text-brand-ink/65">Pas encore d&rsquo;avis</span>;
  }

  return (
    <span className="inline-flex items-center gap-1 text-sm font-semibold text-brand-ink">
      <span aria-hidden="true">★</span>
      {summary.average?.toFixed(1)}
      <span className="font-normal text-brand-ink/65">
        ({summary.count} avis)
      </span>
    </span>
  );
}
