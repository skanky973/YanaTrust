import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getInterventionById } from "@/lib/interventions/queries";
import { createClient } from "@/lib/supabase/server";
import { CompletionReportForm } from "@/components/interventions/CompletionReportForm";

export const metadata: Metadata = {
  title: "Terminer l'intervention — YanaTrust",
};

export default async function TerminerInterventionPage({
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
    redirect(`/connexion?suivant=/planning/${id}/terminer`);
  }

  const intervention = await getInterventionById(id);

  if (!intervention || intervention.provider_id !== user.id) {
    notFound();
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-4 py-8">
      <h1 className="text-2xl font-bold text-brand-green-dark">
        Terminer l&rsquo;intervention
      </h1>
      <p className="text-sm text-brand-ink/70">{intervention.title}</p>

      <CompletionReportForm interventionId={intervention.id} />
    </div>
  );
}
