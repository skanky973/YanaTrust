import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";

const BUCKET = "intervention-photos";
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

function sanitizeFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9.\-_]/g, "_").slice(-80);
}

export async function uploadInterventionPhotos(
  supabase: SupabaseClient<Database>,
  {
    interventionId,
    type,
    files,
  }: {
    interventionId: string;
    type: "before" | "after";
    files: File[];
  },
) {
  const validFiles = files
    .filter((file) => file.size > 0)
    .filter((file) => ALLOWED_TYPES.includes(file.type))
    .filter((file) => file.size <= MAX_FILE_SIZE_BYTES)
    .slice(0, 6);

  for (const file of validFiles) {
    const path = `${interventionId}/${type}-${crypto.randomUUID()}-${sanitizeFileName(file.name)}`;

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(path, file, { contentType: file.type });

    if (uploadError) {
      console.error("uploadInterventionPhotos:", uploadError.message);
      continue;
    }

    await supabase.from("intervention_photos").insert({
      intervention_id: interventionId,
      type,
      path,
    });
  }
}
