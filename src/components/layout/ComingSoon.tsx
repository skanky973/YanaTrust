export function ComingSoon({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 py-12 text-center">
      <h1 className="text-xl font-bold text-brand-green-dark">{title}</h1>
      <p className="max-w-xs text-sm text-brand-ink/70">{description}</p>
      <span className="mt-2 rounded-full bg-brand-gold/30 px-3 py-1 text-xs font-semibold text-brand-green-dark">
        Bientôt disponible
      </span>
    </div>
  );
}
