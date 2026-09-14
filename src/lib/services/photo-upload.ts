import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";

const BUCKET = "service-photos";
const MAX_PHOTOS_PER_SERVICE = 4;
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

function sanitizeFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9.\-_]/g, "_").slice(-80);
}

export async function uploadServicePhotos(
  supabase: SupabaseClient<Database>,
  {
    serviceId,
    providerId,
    files,
    existingCount,
  }: {
    serviceId: string;
    providerId: string;
    files: File[];
    existingCount: number;
  },
) {
  const remainingSlots = MAX_PHOTOS_PER_SERVICE - existingCount;
  const validFiles = files
    .filter((file) => file.size > 0)
    .filter((file) => ALLOWED_TYPES.includes(file.type))
    .filter((file) => file.size <= MAX_FILE_SIZE_BYTES)
    .slice(0, Math.max(remainingSlots, 0));

  for (const file of validFiles) {
    const path = `${providerId}/${serviceId}/${crypto.randomUUID()}-${sanitizeFileName(file.name)}`;

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(path, file, { contentType: file.type });

    if (uploadError) {
      console.error("uploadServicePhotos:", uploadError.message);
      continue;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from(BUCKET).getPublicUrl(path);

    await supabase
      .from("service_photos")
      .insert({ service_id: serviceId, path, url: publicUrl });
  }
}
