"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

async function requireCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Non authentifié.");
  }

  return { supabase, userId: user.id };
}

export async function toggleFavoriteProvider(providerId: string) {
  const { supabase, userId } = await requireCurrentUser();

  const { data: existing } = await supabase
    .from("favorite_providers")
    .select("provider_id")
    .eq("user_id", userId)
    .eq("provider_id", providerId)
    .maybeSingle();

  if (existing) {
    await supabase
      .from("favorite_providers")
      .delete()
      .eq("user_id", userId)
      .eq("provider_id", providerId);
  } else {
    await supabase
      .from("favorite_providers")
      .insert({ user_id: userId, provider_id: providerId });
  }

  revalidatePath("/favoris");
  revalidatePath(`/prestataires/${providerId}`);
}

export async function toggleFavoriteService(serviceId: string) {
  const { supabase, userId } = await requireCurrentUser();

  const { data: existing } = await supabase
    .from("favorite_services")
    .select("service_id")
    .eq("user_id", userId)
    .eq("service_id", serviceId)
    .maybeSingle();

  if (existing) {
    await supabase
      .from("favorite_services")
      .delete()
      .eq("user_id", userId)
      .eq("service_id", serviceId);
  } else {
    await supabase
      .from("favorite_services")
      .insert({ user_id: userId, service_id: serviceId });
  }

  revalidatePath("/favoris");
  revalidatePath(`/services/${serviceId}`);
}
