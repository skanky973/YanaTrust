import "server-only";
import Stripe from "stripe";

// Instancié à la première utilisation plutôt qu'au chargement du module :
// permet au build de passer même quand STRIPE_SECRET_KEY n'est pas encore
// configurée (la route webhook est seulement analysée, pas exécutée, lors de
// la collecte des pages par Next.js).
let stripeInstance: Stripe | null = null;

export function getStripe(): Stripe {
  if (!stripeInstance) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error("STRIPE_SECRET_KEY n'est pas configurée.");
    }
    stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);
  }
  return stripeInstance;
}
