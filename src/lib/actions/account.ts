"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/service-role";

/**
 * Droit à l'effacement.
 *
 * Le compte n'est pas supprimé au sens strict, il est anonymisé, et ce choix
 * est délibéré. profiles.id référence auth.users avec une suppression en
 * cascade : effacer le compte d'authentification effacerait le profil, et avec
 * lui les réservations, les paiements et les trajets qui en dépendent. Or les
 * pièces se rapportant à un paiement doivent être conservées au titre des
 * obligations comptables. Une suppression brutale détruirait donc des données
 * que la loi impose de garder, tout en laissant des réservations orphelines
 * chez les autres utilisateurs.
 *
 * Ce qui est fait à la place :
 *   - les données d'identification du profil sont effacées ou remplacées ;
 *   - le numéro de téléphone est supprimé ;
 *   - la photo de profil est supprimée du stockage ;
 *   - les annonces sont archivées, donc retirées du public ;
 *   - l'adresse e-mail est remplacée par une adresse neutre et le compte est
 *     bloqué, de sorte que plus personne ne puisse s'y connecter ni retrouver
 *     la personne par son adresse.
 *
 * Il ne subsiste ainsi aucune donnée permettant d'identifier la personne, mais
 * l'historique comptable reste cohérent.
 *
 * C'est le seul endroit de l'application, avec le webhook Stripe, où la clé
 * d'administration est employée depuis une action déclenchée par un
 * utilisateur. L'identifiant traité provient exclusivement de la session
 * vérifiée côté serveur : il n'est jamais lu depuis le formulaire, de sorte
 * qu'on ne peut pas faire supprimer le compte de quelqu'un d'autre.
 */
export async function supprimerMonCompte() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/connexion");
  }

  const id = user.id;
  const admin = createServiceRoleClient();

  await admin
    .from("profiles")
    .update({
      first_name: "Compte",
      last_name: "supprimé",
      city: null,
      service_area: null,
      bio: null,
      avatar_url: null,
      is_provider: false,
    })
    .eq("id", id);

  await admin.from("profile_phones").delete().eq("id", id);

  const { data: fichiers } = await admin.storage.from("avatars").list(id);
  if (fichiers && fichiers.length > 0) {
    await admin.storage.from("avatars").remove(fichiers.map((f) => `${id}/${f.name}`));
  }

  // Les annonces sont retirées du public sans être détruites : un service
  // supprimé ferait disparaître les interventions qui s'y rattachent.
  await admin.from("services").update({ status: "archived" }).eq("provider_id", id);

  await admin.auth.admin.updateUserById(id, {
    email: `supprime+${id}@yanatrust.invalid`,
    // .invalid est un domaine réservé qui ne peut appartenir à personne :
    // l'adresse ne risque donc jamais d'atteindre une boîte réelle.
    ban_duration: "876000h",
    user_metadata: {},
  });

  await supabase.auth.signOut();

  redirect("/?compte=supprime");
}
