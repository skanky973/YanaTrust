import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getInterventionById } from "@/lib/interventions/queries";
import { createClient } from "@/lib/supabase/server";
import { RescheduleForm } from "@/components/interventions/RescheduleForm";

export const metadata: Metadata = {
  title: "Reprogrammer — YanaTrust",
};

export default async function ReprogrammerPage({
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
    redirect(`/connexion?suivant=/planning/${id}/reprogrammer`);
  }

  const intervention = await getInterventionById(id);

  if (!intervention || intervention.provider_id !== user.id) {
    notFound();
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-4 py-8">
      <h1 className="text-2xl font-bold text-brand-green-dark">
        Reprogrammer l&rsquo;intervention
      </h1>
      <p className="text-sm text-brand-ink/70">{intervention.title}</p>

      <RescheduleForm intervention={intervention} />
    </div>
  );
}
