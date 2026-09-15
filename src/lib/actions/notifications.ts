"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function openNotification(notificationId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/connexion");

  const { data: notification } = await supabase
    .from("notifications")
    .select("intervention_id")
    .eq("id", notificationId)
    .eq("user_id", user.id)
    .single();

  await supabase
    .from("notifications")
    .update({ read: true })
    .eq("id", notificationId)
    .eq("user_id", user.id);

  redirect(notification?.intervention_id ? `/planning/${notification.intervention_id}` : "/notifications");
}
