import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";

export const AVATAR_REQUIS_MESSAGE =
  "Ajoutez une photo de profil avant de continuer : sur YanaTrust, on sait à qui on a affaire.";

/**
 * L'inscription reste libre, mais les actions qui engagent quelqu'un d'autre
 * — publier un service, proposer un trajet, réserver une place — exigent une
 * photo de profil. C'est le moment où la confiance compte, et c'est là qu'on
 * la demande, plutôt que de faire fuir à l'inscription.
 *
 * La vérification est faite côté serveur dans chaque action concernée : masquer
 * un bouton dans la page ne protège de rien, la requête peut être envoyée
 * directement.
 */
export async function aUnePhotoDeProfil(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<boolean> {
  const { data } = await supabase
    .from("profiles")
    .select("avatar_url")
    .eq("id", userId)
    .maybeSingle();

  return Boolean(data?.avatar_url);
}
