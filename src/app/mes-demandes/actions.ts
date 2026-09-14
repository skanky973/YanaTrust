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

export async function deleteRequest(requestId: string) {
  const { supabase, userId } = await requireCurrentUser();

  await supabase
    .from("requests")
    .delete()
    .eq("id", requestId)
    .eq("client_id", userId);

  revalidatePath("/mes-demandes");
}
