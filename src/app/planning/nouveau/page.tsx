import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { InterventionForm } from "@/components/interventions/InterventionForm";

export const metadata: Metadata = {
  title: "Nouvelle intervention — YanaTrust",
};

export default async function NouvelleInterventionPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/connexion?suivant=/planning/nouveau");
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-4 py-8">
      <h1 className="text-2xl font-bold text-brand-green-dark">
        Ajouter une intervention
      </h1>

      <InterventionForm />
    </div>
  );
}
