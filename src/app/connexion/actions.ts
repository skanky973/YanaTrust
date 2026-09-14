"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { signInSchema } from "@/lib/validation/auth";
import type { ActionState } from "@/lib/actions/action-state";

function isSafeRedirectPath(path: string | null): path is string {
  return !!path && path.startsWith("/") && !path.startsWith("//");
}

export async function signIn(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = signInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    return { error: "E-mail ou mot de passe incorrect." };
  }

  const next = formData.get("next");
  const redirectPath = isSafeRedirectPath(next?.toString() ?? null)
    ? (next as FormDataEntryValue).toString()
    : "/profil";

  redirect(redirectPath);
}
