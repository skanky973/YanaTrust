import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getServicePhotos } from "@/lib/services/queries";
import { EditServiceForm } from "@/components/services/EditServiceForm";

export const metadata: Metadata = {
  title: "Modifier le service — YanaTrust",
};

export default async function ModifierServicePage({
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
    redirect(`/connexion?suivant=/mes-services/${id}`);
  }

  const { data: service } = await supabase
    .from("services")
    .select("*")
    .eq("id", id)
    .eq("provider_id", user.id)
    .single();

  if (!service) {
    notFound();
  }

  const photos = await getServicePhotos(service.id);

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-4 py-8">
      <h1 className="text-2xl font-bold text-brand-green-dark">
        Modifier le service
      </h1>

      <EditServiceForm service={service} photos={photos} />
    </div>
  );
}
