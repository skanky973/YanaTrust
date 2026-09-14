"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requestFormSchema } from "@/lib/validation/request";
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

  const { error } = await supabase.from("requests").insert({
    client_id: user.id,
    title,
    category,
    description,
    budget: budget ? Number(budget) : null,
    city: city || null,
    desired_date: desiredDate || null,
  });

  if (error) {
    return { error: "Impossible de publier la demande." };
  }

  redirect("/mes-demandes");
}
