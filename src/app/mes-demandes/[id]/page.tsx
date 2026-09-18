import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { EditRequestForm } from "@/components/requests/EditRequestForm";
import { ApplicationCard } from "@/components/requests/ApplicationCard";
import { getApplicationsForRequest } from "@/lib/applications/queries";

export const metadata: Metadata = {
  title: "Modifier la demande — YanaTrust",
};

export default async function ModifierDemandePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/connexion?suivant=/mes-demandes/${id}`);
  }

  const { data: request } = await supabase
    .from("requests")
    .select("*")
    .eq("id", id)
    .eq("client_id", user.id)
    .single();

  if (!request) {
    notFound();
  }

  const applications = await getApplicationsForRequest(id);

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-4 py-8">
      <div id="candidatures" className="flex flex-col gap-3 scroll-mt-4">
        <h2 className="text-lg font-semibold text-brand-ink">
          Candidatures ({applications.length})
        </h2>
        {applications.length === 0 ? (
          <p className="rounded-xl bg-white shadow-sm shadow-black/5 p-4 text-sm text-brand-ink/70">
            Aucune candidature pour le moment.
          </p>
        ) : (
          applications.map((application) => (
            <ApplicationCard key={application.id} application={application} />
          ))
        )}
      </div>

      <h1 className="text-2xl font-bold text-brand-green-dark">
        Modifier la demande
      </h1>

      <EditRequestForm request={request} />
    </div>
  );
}
