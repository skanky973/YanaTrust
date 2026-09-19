import Link from "next/link";
import { BadgeCheck } from "lucide-react";
import { formatCity } from "@/lib/format/city";
import { Avatar } from "@/components/ui/Avatar";
import type { RecommendedProvider } from "@/lib/profiles/recommended";

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
      <Avatar
        firstName={provider.first_name}
        lastName={provider.last_name}
        photoUrl={provider.avatar_url}
        size="md"
      />
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
        <p className="text-xs text-brand-ink/70">
          {formatCity(provider.city) || "Ville non renseignée"}
        </p>
      </div>
      <div className="shrink-0 text-right">
        {provider.averageRating !== null ? (
          <p className="text-sm font-semibold text-brand-ink">
            ★ {provider.averageRating.toFixed(1)}
          </p>
        ) : null}
        <p className="text-xs text-brand-ink/65">
          TrustScore {provider.trustScore}
        </p>
      </div>
    </Link>
  );
}
