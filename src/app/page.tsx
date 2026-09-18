import Link from "next/link";
import { Search, MapPin } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getRecommendedProviders } from "@/lib/profiles/recommended";
import { CategoryGrid } from "@/components/home/CategoryGrid";
import { RecommendedProviderCard } from "@/components/home/RecommendedProviderCard";
import { LinkButton } from "@/components/ui/Button";
import { YanaTrustMark } from "@/components/brand/YanaTrustMark";
import { YanaTrustWordmark } from "@/components/brand/YanaTrustWordmark";

export default async function AccueilPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const recommendedProviders = await getRecommendedProviders(3);

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-4 py-6">
      {/* Marque, promesse et lieu forment un seul bloc. Ils étaient auparavant
          trois éléments séparés par l'espacement général de la page, rattrapé
          par une marge négative : l'ensemble se lisait comme trois annonces
          sans rapport plutôt que comme une identité. */}
      <header className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <YanaTrustMark className="h-9 w-9" />
            <YanaTrustWordmark className="text-lg" />
          </div>
          <Link
            href={user ? "/profil" : "/connexion"}
            className="text-sm font-semibold text-brand-green-dark"
          >
            {user ? "Mon profil" : "Se connecter"}
          </Link>
        </div>

        <div className="flex flex-col gap-1">
          <p className="text-sm text-brand-ink/70">
            Les services d&rsquo;ici, en toute confiance.
          </p>
          <p className="flex items-center gap-1 text-sm font-medium text-brand-ink/70">
            <MapPin className="h-4 w-4 text-brand-green" aria-hidden="true" />
            Saint-Laurent-du-Maroni, Guyane
          </p>
        </div>
      </header>

      <h1 className="-mb-2 text-xl font-bold text-brand-ink">
        De quoi avez-vous besoin ?
      </h1>

      <Link
        href="/recherche"
        className="flex items-center gap-3 rounded-xl bg-white shadow-sm shadow-black/5 px-4 py-3 text-sm text-brand-ink/65"
      >
        <Search className="h-5 w-5 text-brand-ink/65" aria-hidden="true" />
        Rechercher un service, un pro...
      </Link>

      <CategoryGrid />

      <div className="rounded-xl bg-brand-green-dark p-5 text-brand-cream">
        <h2 className="text-lg font-bold">
          Besoin de quelqu&rsquo;un pour une tâche ou un service ?
        </h2>
        <p className="mt-1 text-sm text-brand-cream/80">
          Publiez votre demande et recevez des propositions de prestataires
          près de chez vous.
        </p>
        <LinkButton
          href={user ? "/publier/demande" : "/connexion?suivant=/publier/demande"}
          variant="secondary"
          className="mt-4 w-full"
        >
          + Publier une demande
        </LinkButton>
      </div>

      {recommendedProviders.length > 0 ? (
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-brand-ink">
              Prestataires recommandés
            </h2>
            <Link
              href="/recherche"
              className="text-sm font-semibold text-brand-green-dark"
            >
              Voir tout
            </Link>
          </div>
          <div className="flex flex-col gap-3">
            {recommendedProviders.map((provider) => (
              <RecommendedProviderCard key={provider.id} provider={provider} />
            ))}
          </div>
        </div>
      ) : null}

      {!user ? (
        <div className="flex flex-col gap-3 pt-2">
          <LinkButton href="/inscription" variant="primary">
            Créer un compte
          </LinkButton>
        </div>
      ) : null}
    </div>
  );
}
