"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requestFormSchema } from "@/lib/validation/request";
import { uploadRequestPhotos } from "@/lib/requests/photo-upload";
import type { ActionState } from "@/lib/actions/action-state";

export async function createRequest(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = requestFormSchema.safeParse({
    title: formData.get("title"),
    category: formData.get("category"),
    description: formData.get("description"),
    budget: formData.get("budget"),
    city: formData.get("city"),
    desiredDate: formData.get("desiredDate"),
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

  const { title, category, description, budget, city, desiredDate } =
    parsed.data;

  const { data: created, error } = await supabase
    .from("requests")
    .insert({
      client_id: user.id,
      title,
      category,
      description,
      budget: budget ? Number(budget) : null,
      city: city || null,
      desired_date: desiredDate || null,
    })
    .select("id")
    .single();

  if (error || !created) {
    console.error("createRequest:", error?.message, error?.code, error?.details, error?.hint);
    return { error: "Impossible de publier la demande." };
  }

  const photos = formData.getAll("photos").filter((f): f is File => f instanceof File);
  if (photos.length > 0) {
    await uploadRequestPhotos(supabase, { requestId: created.id, files: photos });
  }

  redirect("/mes-demandes");
}
