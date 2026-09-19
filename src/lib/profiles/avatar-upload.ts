import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";

const BUCKET = "avatars";
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export const AVATAR_ACCEPT = ALLOWED_TYPES.join(",");

function sanitizeFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9.\-_]/g, "_").slice(-80);
}

/**
 * Envoie la photo de profil et renvoie son URL publique, ou un message
 * d'erreur destiné à l'utilisateur. Le nom de fichier est tiré au hasard
 * plutôt que réutilisé : un chemin fixe resterait affiché en version périmée
 * tant que le cache du navigateur n'expire pas.
 *
 * L'ancienne photo est supprimée après coup, jamais avant : si l'envoi de la
 * nouvelle échoue, l'utilisateur garde celle qu'il avait.
 */
export async function uploadAvatar(
  supabase: SupabaseClient<Database>,
  { userId, file }: { userId: string; file: File },
): Promise<{ url: string } | { error: string }> {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { error: "Format accepté : JPEG, PNG ou WebP." };
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return { error: "La photo ne doit pas dépasser 5 Mo." };
  }

  const path = `${userId}/${crypto.randomUUID()}-${sanitizeFileName(file.name)}`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { contentType: file.type });

  if (uploadError) {
    console.error("uploadAvatar:", uploadError.message);
    return { error: "L'envoi de la photo a échoué." };
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(BUCKET).getPublicUrl(path);

  const { data: anciennes } = await supabase.storage.from(BUCKET).list(userId);

  const aSupprimer = (anciennes ?? [])
    .map((f) => `${userId}/${f.name}`)
    .filter((p) => p !== path);

  if (aSupprimer.length > 0) {
    await supabase.storage.from(BUCKET).remove(aSupprimer);
  }

  return { url: publicUrl };
}
