import { toggleFavoriteProvider } from "@/lib/actions/favorites";
import { isProviderFavorited } from "@/lib/favorites/queries";
import { createClient } from "@/lib/supabase/server";

export async function FavoriteProviderButton({
  providerId,
}: {
  providerId: string;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.id === providerId) return null;

  const isFavorited = await isProviderFavorited(providerId);

  return (
    <form action={toggleFavoriteProvider.bind(null, providerId)}>
      <button
        type="submit"
        aria-pressed={isFavorited}
        className={`w-full rounded-xl border px-4 py-3 text-sm font-semibold ${
          isFavorited
            ? "border-brand-gold bg-brand-gold/20 text-brand-green-dark"
            : "border-brand-ink/15 bg-white text-brand-ink"
        }`}
      >
        {isFavorited ? "★ Prestataire en favori" : "☆ Ajouter ce prestataire aux favoris"}
      </button>
    </form>
  );
}
