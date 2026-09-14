"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { profileUpdateSchema } from "@/lib/validation/profile";
import type { ActionState } from "@/lib/actions/action-state";

export async function updateProfile(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = profileUpdateSchema.safeParse({
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    phone: formData.get("phone"),
    city: formData.get("city"),
    serviceArea: formData.get("serviceArea"),
    bio: formData.get("bio"),
    isProvider: formData.get("isProvider") === "on",
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

  const { firstName, lastName, phone, city, serviceArea, bio, isProvider } =
    parsed.data;

  // La ligne ne peut être ciblée que par id = auth.uid() : la policy RLS
  // "Users can update own profile" empêche toute modification d'un autre
  // profil même si cet id venait à être altéré côté client.
  const { error } = await supabase
    .from("profiles")
    .update({
      first_name: firstName,
      last_name: lastName,
      phone: phone || null,
      city: city || null,
      service_area: serviceArea || null,
      bio: bio || null,
      is_provider: isProvider,
    })
    .eq("id", user.id);

  if (error) {
    return { error: "Impossible d'enregistrer le profil." };
  }

  revalidatePath("/profil");
  revalidatePath("/profil/modifier");

  return { success: true };
}
