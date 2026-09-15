import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Report } from "@/lib/supabase/database.types";

export type ReportWithContext = Report & {
  reporter: { id: string; first_name: string; last_name: string } | null;
  targetLabel: string;
  targetServiceId: string | null;
};

export async function isCurrentUserAdmin(): Promise<boolean> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return false;

  const { data } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  return !!data?.is_admin;
}

export async function getPendingReportCount(): Promise<number> {
  const supabase = await createClient();
  const { count, error } = await supabase
    .from("reports")
    .select("id", { count: "exact", head: true })
    .eq("status", "pending");

  if (error) return 0;
  return count ?? 0;
}

export async function getReports(status?: string): Promise<ReportWithContext[]> {
  const supabase = await createClient();

  let query = supabase
    .from("reports")
    .select("*, reporter:profiles!reports_reporter_id_fkey(id, first_name, last_name)")
    .order("created_at", { ascending: false });

  if (status) {
    query = query.eq("status", status);
  }

  const { data, error } = await query;

  if (error || !data) {
    console.error("getReports:", error?.message);
    return [];
  }

  const reports = data as unknown as (Report & {
    reporter: { id: string; first_name: string; last_name: string } | null;
  })[];

  const profileIds = reports.filter((r) => r.target_type === "profile").map((r) => r.target_id);
  const serviceIds = reports.filter((r) => r.target_type === "service").map((r) => r.target_id);
  const messageIds = reports.filter((r) => r.target_type === "message").map((r) => r.target_id);

  const [profilesRes, servicesRes, messagesRes] = await Promise.all([
    profileIds.length
      ? supabase.from("profiles").select("id, first_name, last_name").in("id", profileIds)
      : Promise.resolve({ data: [] as { id: string; first_name: string; last_name: string }[] }),
    serviceIds.length
      ? supabase.from("services").select("id, title").in("id", serviceIds)
      : Promise.resolve({ data: [] as { id: string; title: string }[] }),
    messageIds.length
      ? supabase.from("messages").select("id, content").in("id", messageIds)
      : Promise.resolve({ data: [] as { id: string; content: string }[] }),
  ]);

  const profileById = new Map((profilesRes.data ?? []).map((p) => [p.id, p]));
  const serviceById = new Map((servicesRes.data ?? []).map((s) => [s.id, s]));
  const messageById = new Map((messagesRes.data ?? []).map((m) => [m.id, m]));

  return reports.map((report) => {
    let targetLabel = "Contenu introuvable (supprimé)";
    let targetServiceId: string | null = null;

    if (report.target_type === "profile") {
      const p = profileById.get(report.target_id);
      if (p) targetLabel = `${p.first_name} ${p.last_name}`;
    } else if (report.target_type === "service") {
      const s = serviceById.get(report.target_id);
      if (s) {
        targetLabel = s.title;
        targetServiceId = s.id;
      }
    } else if (report.target_type === "message") {
      const m = messageById.get(report.target_id);
      if (m) targetLabel = m.content;
    }

    return { ...report, targetLabel, targetServiceId };
  });
}
