import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getMyRequests } from "@/lib/requests/queries";
import { createClient } from "@/lib/supabase/server";
import { MyRequestCard } from "@/components/requests/MyRequestCard";
import { LinkButton } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Mes demandes — YanaTrust",
};

export default async function MesDemandesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/connexion?suivant=/mes-demandes");
  }

  const requests = await getMyRequests();

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-4 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-brand-green-dark">
          Mes demandes
        </h1>
        <LinkButton
          href="/publier/demande"
          variant="primary"
          className="px-3 py-2 text-xs"
        >
          + Publier
        </LinkButton>
      </div>

      {requests.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl bg-white shadow-sm shadow-black/5 p-8 text-center">
          <p className="text-sm text-brand-ink/60">
            Vous n&rsquo;avez encore publié aucune demande.
          </p>
          <LinkButton href="/publier/demande" variant="primary">
            Publier ma première demande
          </LinkButton>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {requests.map((request) => (
            <MyRequestCard key={request.id} request={request} />
          ))}
        </div>
      )}
    </div>
  );
}
