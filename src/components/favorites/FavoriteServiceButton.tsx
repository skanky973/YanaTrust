import { toggleFavoriteService } from "@/lib/actions/favorites";
import { isServiceFavorited } from "@/lib/favorites/queries";
import { createClient } from "@/lib/supabase/server";

export async function FavoriteServiceButton({
  serviceId,
}: {
  serviceId: string;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const isFavorited = await isServiceFavorited(serviceId);

  return (
    <form action={toggleFavoriteService.bind(null, serviceId)}>
      <button
        type="submit"
        aria-pressed={isFavorited}
        className={`w-full rounded-xl border px-4 py-3 text-sm font-semibold ${
          isFavorited
            ? "border-brand-gold bg-brand-gold/20 text-brand-green-dark"
            : "border-brand-ink/15 bg-white text-brand-ink"
        }`}
      >
        {isFavorited ? "★ Dans mes favoris" : "☆ Ajouter aux favoris"}
      </button>
    </form>
  );
}
