import Link from "next/link";
import { BadgeCheck } from "lucide-react";
import type { RecommendedProvider } from "@/lib/profiles/recommended";

function initials(firstName: string, lastName: string) {
  return `${firstName[0] ?? ""}${lastName[0] ?? ""}`.toUpperCase() || "?";
}

export function RecommendedProviderCard({
  provider,
}: {
  provider: RecommendedProvider;
}) {
  return (
    <Link
      href={`/prestataires/${provider.id}`}
      className="flex items-center gap-3 rounded-xl bg-white shadow-sm shadow-black/5 p-4"
    >
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-green-dark text-sm font-bold text-brand-cream">
        {initials(provider.first_name, provider.last_name)}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <p className="truncate font-semibold text-brand-ink">
            {provider.first_name} {provider.last_name}
          </p>
          {provider.identity_verified ? (
            <BadgeCheck
              className="h-4 w-4 shrink-0 text-brand-green"
              aria-label="Identité vérifiée"
            />
          ) : null}
        </div>
        <p className="text-xs text-brand-ink/60">
          {provider.city || "Ville non renseignée"}
        </p>
      </div>
      <div className="shrink-0 text-right">
        {provider.averageRating !== null ? (
          <p className="text-sm font-semibold text-brand-ink">
            ★ {provider.averageRating.toFixed(1)}
          </p>
        ) : null}
        <p className="text-xs text-brand-ink/50">
          TrustScore {provider.trustScore}
        </p>
      </div>
    </Link>
  );
}
