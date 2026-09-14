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

export async function archiveService(serviceId: string) {
  const { supabase, userId } = await requireCurrentUser();

  // La policy RLS "Users can update own services" garantit qu'un utilisateur
  // ne peut modifier que ses propres lignes même si provider_id était altéré.
  await supabase
    .from("services")
    .update({ status: "archived" })
    .eq("id", serviceId)
    .eq("provider_id", userId);

  revalidatePath("/mes-services");
  revalidatePath("/recherche");
}

export async function unarchiveService(serviceId: string) {
  const { supabase, userId } = await requireCurrentUser();

  await supabase
    .from("services")
    .update({ status: "active" })
    .eq("id", serviceId)
    .eq("provider_id", userId);

  revalidatePath("/mes-services");
  revalidatePath("/recherche");
}

export async function deleteService(serviceId: string) {
  const { supabase, userId } = await requireCurrentUser();

  await supabase
    .from("services")
    .delete()
    .eq("id", serviceId)
    .eq("provider_id", userId);

  revalidatePath("/mes-services");
  revalidatePath("/recherche");
}
