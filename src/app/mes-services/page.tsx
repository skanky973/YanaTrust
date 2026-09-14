import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getMyServices } from "@/lib/services/queries";
import { createClient } from "@/lib/supabase/server";
import { MyServiceCard } from "@/components/services/MyServiceCard";
import { LinkButton } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Mes services — YanaTrust",
};

export default async function MesServicesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/connexion?suivant=/mes-services");
  }

  const services = await getMyServices();

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-4 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-brand-green-dark">
          Mes services
        </h1>
        <LinkButton href="/publier/service" variant="primary" className="px-3 py-2 text-xs">
          + Publier
        </LinkButton>
      </div>

      {services.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl bg-white shadow-sm shadow-black/5 p-8 text-center">
          <p className="text-sm text-brand-ink/60">
            Vous n&rsquo;avez encore publié aucun service.
          </p>
          <LinkButton href="/publier/service" variant="primary">
            Publier mon premier service
          </LinkButton>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {services.map((service) => (
            <MyServiceCard key={service.id} service={service} />
          ))}
        </div>
      )}
    </div>
  );
}
