"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { resetPasswordSchema } from "@/lib/validation/auth";
import type { ActionState } from "@/lib/actions/action-state";

export async function updatePassword(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = resetPasswordSchema.safeParse({
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      error:
        "Votre lien de réinitialisation a expiré. Demandez-en un nouveau.",
    };
  }

  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });

  if (error) {
    return { error: "Impossible de mettre à jour le mot de passe." };
  }

  return { success: true };
}
