"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { profileUpdateSchema } from "@/lib/validation/profile";
import { uploadAvatar } from "@/lib/profiles/avatar-upload";
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

  // La photo n'est envoyée que si l'utilisateur en a choisi une : un champ
  // fichier laissé vide arrive comme un File de taille nulle, qu'il ne faut
  // surtout pas prendre pour une demande de remplacement.
  const avatarFile = formData.get("avatar");
  let avatarUrl: string | undefined;

  if (avatarFile instanceof File && avatarFile.size > 0) {
    const resultat = await uploadAvatar(supabase, {
      userId: user.id,
      file: avatarFile,
    });

    if ("error" in resultat) {
      return { error: resultat.error };
    }

    avatarUrl = resultat.url;
  }

  // La ligne ne peut être ciblée que par id = auth.uid() : la policy RLS
  // "Users can update own profile" empêche toute modification d'un autre
  // profil même si cet id venait à être altéré côté client.
  const { error } = await supabase
    .from("profiles")
    .update({
      first_name: firstName,
      last_name: lastName,
      city: city || null,
      service_area: serviceArea || null,
      bio: bio || null,
      is_provider: isProvider,
      ...(avatarUrl ? { avatar_url: avatarUrl } : {}),
    })
    .eq("id", user.id);

  if (error) {
    return { error: "Impossible d'enregistrer le profil." };
  }

  // Le téléphone vit dans une table séparée, privée (voir profile_phones).
  const { error: phoneError } = await supabase
    .from("profile_phones")
    .upsert({ id: user.id, phone: phone || null, updated_at: new Date().toISOString() });

  if (phoneError) {
    return { error: "Impossible d'enregistrer le téléphone." };
  }

  revalidatePath("/profil");
  revalidatePath("/profil/modifier");

  return { success: true };
}
