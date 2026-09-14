import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { EditRequestForm } from "@/components/requests/EditRequestForm";

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

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-4 py-8">
      <h1 className="text-2xl font-bold text-brand-green-dark">
        Modifier la demande
      </h1>

      <EditRequestForm request={request} />
    </div>
  );
}
