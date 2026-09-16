import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getMyStripeAccount } from "@/lib/carpool/queries";
import { startStripeOnboarding } from "@/lib/actions/stripe-connect";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Paiements — YanaTrust",
};

export default async function PaiementsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/connexion?suivant=/profil/paiements");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_provider")
    .eq("id", user.id)
    .single();

  if (!profile?.is_provider) {
    redirect("/profil");
  }

  const account = await getMyStripeAccount();

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-4 py-8">
      <h1 className="text-2xl font-bold text-brand-green-dark">Paiements</h1>

      <p className="text-sm text-brand-ink/70">
        Pour publier des trajets de covoiturage et être payé directement sur
        l&rsquo;application, vous devez activer les paiements via Stripe, notre
        prestataire de paiement.
      </p>

      <div className="rounded-xl bg-white shadow-sm shadow-black/5 p-4">
        {account?.payouts_enabled ? (
          <p className="text-sm font-semibold text-brand-green-dark">
            ✓ Paiements activés. Vous pouvez publier des trajets de covoiturage.
          </p>
        ) : account ? (
          <div className="flex flex-col gap-3">
            <p className="text-sm text-brand-ink/70">
              Votre compte de paiement est en cours de configuration. Terminez
              les informations demandées par Stripe pour commencer à recevoir
              des paiements.
            </p>
            <form action={startStripeOnboarding}>
              <Button type="submit" variant="primary" className="w-full">
                Continuer la configuration
              </Button>
            </form>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <p className="text-sm text-brand-ink/70">
              Aucun compte de paiement configuré pour l&rsquo;instant.
            </p>
            <form action={startStripeOnboarding}>
              <Button type="submit" variant="primary" className="w-full">
                Configurer mes paiements
              </Button>
            </form>
          </div>
        )}
      </div>

      <p className="text-xs text-brand-ink/50">
        Une commission de 10% est prélevée par YanaTrust sur chaque réservation
        payée ; le reste est reversé directement sur votre compte bancaire par
        Stripe.
      </p>
    </div>
  );
}
