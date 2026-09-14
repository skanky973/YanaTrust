"use client";

import { deleteServicePhoto } from "@/app/mes-services/[id]/actions";

export function DeleteServicePhotoButton({
  photoId,
  serviceId,
}: {
  photoId: string;
  serviceId: string;
}) {
  return (
    <form action={deleteServicePhoto.bind(null, photoId, serviceId)}>
      <button
        type="submit"
        aria-label="Supprimer cette photo"
        className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-xs text-white"
      >
        ✕
      </button>
    </form>
  );
}
