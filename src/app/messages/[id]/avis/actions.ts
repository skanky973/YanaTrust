"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { reviewFormSchema } from "@/lib/validation/review";
import type { ActionState } from "@/lib/actions/action-state";

export async function submitReview(
  providerId: string,
  conversationId: string,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = reviewFormSchema.safeParse({
    rating: formData.get("rating"),
    comment: formData.get("comment"),
    punctuality: formData.get("punctuality"),
    quality: formData.get("quality"),
    communication: formData.get("communication"),
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

  const { rating, comment, punctuality, quality, communication } = parsed.data;

  // La policy RLS "Users can review people they have messaged" rejette
  // l'écriture s'il n'existe aucune conversation entre les deux utilisateurs.
  const { error } = await supabase.from("reviews").upsert(
    {
      provider_id: providerId,
      author_id: user.id,
      rating,
      comment: comment || null,
      punctuality,
      quality,
      communication,
    },
    { onConflict: "provider_id,author_id" },
  );

  if (error) {
    return { error: "Impossible d'enregistrer votre avis." };
  }

  redirect(`/messages/${conversationId}`);
}
