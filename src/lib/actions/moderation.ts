"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Non authentifié.");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) {
    throw new Error("Accès refusé.");
  }

  return supabase;
}

export async function markReportReviewed(reportId: string) {
  const supabase = await requireAdmin();
  await supabase.from("reports").update({ status: "reviewed" }).eq("id", reportId);
  revalidatePath("/admin/signalements");
}

export async function dismissReport(reportId: string) {
  const supabase = await requireAdmin();
  await supabase.from("reports").update({ status: "dismissed" }).eq("id", reportId);
  revalidatePath("/admin/signalements");
}

export async function archiveReportedService(reportId: string, serviceId: string) {
  const supabase = await requireAdmin();
  await supabase.from("services").update({ status: "archived" }).eq("id", serviceId);
  await supabase.from("reports").update({ status: "reviewed" }).eq("id", reportId);
  revalidatePath("/admin/signalements");
}
