"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { serviceFormSchema } from "@/lib/validation/service";
import { uploadServicePhotos } from "@/lib/services/photo-upload";
import type { ActionState } from "@/lib/actions/action-state";

export async function createService(
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

  const { data: created, error } = await supabase
    .from("services")
    .insert({
      provider_id: user.id,
      title,
      category,
      description,
      price_from: priceFrom ? Number(priceFrom) : null,
      city: city || null,
      service_area: serviceArea || null,
    })
    .select("id")
    .single();

  if (error || !created) {
    return { error: "Impossible de publier le service." };
  }

  const photos = formData.getAll("photos").filter((f): f is File => f instanceof File);
  if (photos.length > 0) {
    await uploadServicePhotos(supabase, {
      serviceId: created.id,
      providerId: user.id,
      files: photos,
      existingCount: 0,
    });
  }

  redirect("/mes-services");
}
