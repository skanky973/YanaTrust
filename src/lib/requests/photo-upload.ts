import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";

const BUCKET = "request-photos";
const MAX_PHOTOS = 4;
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

function sanitizeFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9.\-_]/g, "_").slice(-80);
}

export async function uploadRequestPhotos(
  supabase: SupabaseClient<Database>,
  { requestId, files }: { requestId: string; files: File[] },
) {
  const validFiles = files
    .filter((file) => file.size > 0)
    .filter((file) => ALLOWED_TYPES.includes(file.type))
    .filter((file) => file.size <= MAX_FILE_SIZE_BYTES)
    .slice(0, MAX_PHOTOS);

  for (const file of validFiles) {
    const path = `${requestId}/${crypto.randomUUID()}-${sanitizeFileName(file.name)}`;

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(path, file, { contentType: file.type });

    if (uploadError) {
      console.error("uploadRequestPhotos:", uploadError.message);
      continue;
    }

    await supabase.from("request_photos").insert({ request_id: requestId, path });
  }
}
