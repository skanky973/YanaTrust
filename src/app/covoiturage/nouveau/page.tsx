import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getMyStripeAccount } from "@/lib/carpool/queries";
import { TripForm } from "@/components/carpool/TripForm";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Publier un trajet — YanaTrust",
};

export default async function NouveauTrajetPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/connexion?suivant=/covoiturage/nouveau");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_provider")
    .eq("id", user.id)
    .single();

  if (!profile?.is_provider) {
    redirect("/covoiturage");
  }

  const account = await getMyStripeAccount();

  if (!account?.payouts_enabled) {
    return (
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-4 px-4 py-8 text-center">
        <h1 className="text-xl font-bold text-brand-green-dark">
          Paiements non configurés
        </h1>
        <p className="text-sm text-brand-ink/70">
          Pour publier un trajet et être payé directement sur l&rsquo;application,
          vous devez d&rsquo;abord configurer vos paiements.
        </p>
        <Link href="/profil/paiements">
          <Button type="button" variant="primary">
            Configurer mes paiements
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-4 py-8">
      <h1 className="text-2xl font-bold text-brand-green-dark">
        Publier un trajet
      </h1>
      <TripForm />
    </div>
  );
}
