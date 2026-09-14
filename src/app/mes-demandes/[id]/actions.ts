"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requestUpdateSchema } from "@/lib/validation/request";
import type { ActionState } from "@/lib/actions/action-state";

export async function updateRequest(
  requestId: string,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = requestUpdateSchema.safeParse({
    title: formData.get("title"),
    category: formData.get("category"),
    description: formData.get("description"),
    budget: formData.get("budget"),
    city: formData.get("city"),
    desiredDate: formData.get("desiredDate"),
    status: formData.get("status"),
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

  const { title, category, description, budget, city, desiredDate, status } =
    parsed.data;

  // La policy RLS "Users can update own requests" empêche toute modification
  // d'une demande qui n'appartient pas à l'utilisateur.
  const { error } = await supabase
    .from("requests")
    .update({
      title,
      category,
      description,
      budget: budget ? Number(budget) : null,
      city: city || null,
      desired_date: desiredDate || null,
      status,
    })
    .eq("id", requestId)
    .eq("client_id", user.id);

  if (error) {
    return { error: "Impossible d'enregistrer les modifications." };
  }

  redirect("/mes-demandes");
}
