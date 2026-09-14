"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getSiteUrl } from "@/lib/site-url";
import { forgotPasswordSchema } from "@/lib/validation/auth";
import type { ActionState } from "@/lib/actions/action-state";

export async function requestPasswordReset(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = forgotPasswordSchema.safeParse({
    email: formData.get("email"),
  });

  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }

  const siteUrl = await getSiteUrl();
  const supabase = await createClient();

  // On ne révèle jamais si l'e-mail existe ou non (évite l'énumération de
  // comptes) : on retourne toujours un succès générique.
  await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${siteUrl}/auth/confirm?next=/reinitialiser-mot-de-passe`,
  });

  return { success: true };
}
