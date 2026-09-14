import { createClient } from "@/lib/supabase/server";
import { LinkButton } from "@/components/ui/Button";

export default async function AccueilPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-8 px-6 py-12 text-center">
      <div className="flex flex-col items-center gap-3">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-green-dark text-2xl font-bold text-brand-cream">
          Y
        </div>
        <h1 className="text-3xl font-bold text-brand-green-dark">
          YanaTrust
        </h1>
        <p className="max-w-xs text-brand-ink/70">
          Les services d&rsquo;ici, en toute confiance.
        </p>
        <p className="text-sm text-brand-ink/50">
          Saint-Laurent-du-Maroni, Guyane
        </p>
      </div>

      <div className="flex w-full max-w-xs flex-col gap-3">
        {user ? (
          <LinkButton href="/profil" variant="primary">
            Voir mon profil
          </LinkButton>
        ) : (
          <>
            <LinkButton href="/inscription" variant="primary">
              Créer un compte
            </LinkButton>
            <LinkButton href="/connexion" variant="ghost">
              Se connecter
            </LinkButton>
          </>
        )}
      </div>
    </div>
  );
}
