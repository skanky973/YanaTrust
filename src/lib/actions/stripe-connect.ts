"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe/client";
import { getSiteUrl } from "@/lib/site-url";

// Crée (si besoin) le compte Stripe Connect Express du prestataire, puis
// redirige vers le formulaire d'activation hébergé par Stripe (identité,
// coordonnées bancaires). payouts_enabled ne passera à true qu'une fois ce
// formulaire complété, via le webhook account.updated.
export async function startStripeOnboarding() {
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

  const { data: existing } = await supabase
    .from("stripe_accounts")
    .select("stripe_account_id")
    .eq("id", user.id)
    .maybeSingle();

  let stripeAccountId = existing?.stripe_account_id;

  if (!stripeAccountId) {
    const created = await getStripe().accounts.create({
      type: "express",
      country: "FR",
      email: user.email ?? undefined,
      capabilities: {
        transfers: { requested: true },
        card_payments: { requested: true },
      },
    });
    stripeAccountId = created.id;

    await supabase.from("stripe_accounts").insert({
      id: user.id,
      stripe_account_id: stripeAccountId,
    });
  }

  const siteUrl = await getSiteUrl();

  const accountLink = await getStripe().accountLinks.create({
    account: stripeAccountId,
    refresh_url: `${siteUrl}/profil/paiements`,
    return_url: `${siteUrl}/profil/paiements`,
    type: "account_onboarding",
  });

  redirect(accountLink.url);
}
