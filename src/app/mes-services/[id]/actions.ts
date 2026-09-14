"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { serviceFormSchema } from "@/lib/validation/service";
import { uploadServicePhotos } from "@/lib/services/photo-upload";
import type { ActionState } from "@/lib/actions/action-state";

export async function updateService(
  serviceId: string,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = serviceFormSchema.safeParse({
    title: formData.get("title"),
    category: formData.get("category"),
    description: formData.get("description"),
    priceFrom: formData.get("priceFrom"),
    city: formData.get("city"),
    serviceArea: formData.get("serviceArea"),
  });

  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Vous devez être connecté." };
  }

  const { title, category, description, priceFrom, city, serviceArea } =
    parsed.data;

  // La policy RLS "Users can update own services" empêche toute modification
  // d'un service qui n'appartient pas à l'utilisateur, même sans le filtre
  // provider_id ci-dessous — celui-ci est une défense en profondeur.
  const { error } = await supabase
    .from("services")
    .update({
      title,
      category,
      description,
      price_from: priceFrom ? Number(priceFrom) : null,
      city: city || null,
      service_area: serviceArea || null,
    })
    .eq("id", serviceId)
    .eq("provider_id", user.id);

  if (error) {
    return { error: "Impossible d'enregistrer les modifications." };
  }

  const photos = formData.getAll("photos").filter((f): f is File => f instanceof File);
  if (photos.length > 0) {
    const { count } = await supabase
      .from("service_photos")
      .select("id", { count: "exact", head: true })
      .eq("service_id", serviceId);

    await uploadServicePhotos(supabase, {
      serviceId,
      providerId: user.id,
      files: photos,
      existingCount: count ?? 0,
    });
  }

  redirect("/mes-services");
}

export async function deleteServicePhoto(photoId: string, serviceId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  // La policy RLS "Providers can delete photos of own services" empêche la
  // suppression d'une photo qui n'appartient pas à l'un de ses propres
  // services, même sans le filtre explicite ci-dessous.
  const { data: photo } = await supabase
    .from("service_photos")
    .select("path")
    .eq("id", photoId)
    .single();

  await supabase.from("service_photos").delete().eq("id", photoId);

  if (photo) {
    await supabase.storage.from("service-photos").remove([photo.path]);
  }

  revalidatePath(`/mes-services/${serviceId}`);
}
