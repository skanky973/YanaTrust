"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { reportSchema } from "@/lib/validation/report";
import type { ActionState } from "@/lib/actions/action-state";

export async function submitReport(
  targetType: "profile" | "service" | "message",
  targetId: string,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = reportSchema.safeParse({
    targetType,
    targetId,
    reason: formData.get("reason"),
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

  const { error } = await supabase.from("reports").insert({
    reporter_id: user.id,
    target_type: parsed.data.targetType,
    target_id: parsed.data.targetId,
    reason: parsed.data.reason,
  });

  if (error) {
    return { error: "Impossible d'envoyer le signalement." };
  }

  return { success: true };
}
