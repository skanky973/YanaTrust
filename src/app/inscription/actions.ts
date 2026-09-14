"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getSiteUrl } from "@/lib/site-url";
import { signUpSchema } from "@/lib/validation/auth";
import type { ActionState } from "@/lib/actions/action-state";

export async function signUp(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = signUpSchema.safeParse({
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    city: formData.get("city"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }

  const { firstName, lastName, email, phone, city, password } = parsed.data;
  const siteUrl = await getSiteUrl();
  const supabase = await createClient();

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { first_name: firstName, last_name: lastName, phone, city },
      emailRedirectTo: `${siteUrl}/auth/confirm?next=/profil`,
    },
  });

  if (error) {
    if (error.code === "user_already_exists") {
      return { error: "Un compte existe déjà avec cet e-mail." };
    }
    return { error: "Impossible de créer le compte. Réessayez." };
  }

  return { success: true };
}
