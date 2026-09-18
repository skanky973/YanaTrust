import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getMyFavorites } from "@/lib/favorites/queries";
import { getCategoryLabel } from "@/lib/services/categories";

export const metadata: Metadata = {
  title: "Mes favoris — YanaTrust",
};

export default async function FavorisPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/connexion?suivant=/favoris");
  }

  const { providers, services } = await getMyFavorites();

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-4 py-8">
      <h1 className="text-2xl font-bold text-brand-green-dark">
        Mes favoris
      </h1>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-brand-ink/70">
          Prestataires
        </h2>
        {providers.length === 0 ? (
          <p className="rounded-xl bg-white shadow-sm shadow-black/5 p-4 text-center text-sm text-brand-ink/65">
            Aucun prestataire en favori.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {providers.map((provider) => (
              <Link
                key={provider.id}
                href={`/prestataires/${provider.id}`}
                className="rounded-xl bg-white shadow-sm shadow-black/5 p-4"
              >
                <p className="font-semibold text-brand-ink">
                  {provider.first_name} {provider.last_name}
                </p>
                <p className="text-sm text-brand-ink/70">
                  {provider.city || "—"}
                </p>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-brand-ink/70">Services</h2>
        {services.length === 0 ? (
          <p className="rounded-xl bg-white shadow-sm shadow-black/5 p-4 text-center text-sm text-brand-ink/65">
            Aucun service en favori.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {services.map((service) => (
              <Link
                key={service.id}
                href={`/services/${service.id}`}
                className="rounded-xl bg-white shadow-sm shadow-black/5 p-4"
              >
                <p className="font-semibold text-brand-ink">
                  {service.title}
                </p>
                <p className="text-sm text-brand-ink/70">
                  {getCategoryLabel(service.category)}
                </p>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
