import { getTrustLevel } from "@/lib/trust/score";

const LEVEL_STYLES: Record<string, string> = {
  eleve: "bg-brand-green/15 text-brand-green-dark",
  moyen: "bg-brand-gold/20 text-brand-green-dark",
  debutant: "bg-brand-ink/10 text-brand-ink/60",
};

export function TrustScoreBadge({
  score,
  size = "md",
}: {
  score: number;
  size?: "sm" | "md";
}) {
  const { level, label } = getTrustLevel(score);

  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded-full font-semibold ${LEVEL_STYLES[level]} ${
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm"
      }`}
    >
      <span>TrustScore {score}/100</span>
      <span className="opacity-70">· {label}</span>
    </div>
  );
}
