import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/supabase/database.types";

export type ProfileWithPhone = Profile & { phone: string | null };

export async function getCurrentProfile(): Promise<ProfileWithPhone | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const [{ data: profile, error }, { data: phoneRow }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase.from("profile_phones").select("phone").eq("id", user.id).maybeSingle(),
  ]);

  if (error || !profile) {
    if (error) console.error("getCurrentProfile:", error.message);
    return null;
  }

  return { ...profile, phone: phoneRow?.phone ?? null };
}

// Profil consultable par un tiers : ne contient jamais le téléphone, qui
// n'est lisible que par son propriétaire (voir profile_phones).
export async function getProfileById(id: string): Promise<Profile | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("getProfileById:", error.message);
    return null;
  }

  return data;
}
