"use client";

import { deleteService } from "@/app/mes-services/actions";

export function DeleteServiceButton({ serviceId }: { serviceId: string }) {
  return (
    <form
      action={deleteService.bind(null, serviceId)}
      onSubmit={(e) => {
        if (!confirm("Supprimer définitivement ce service ?")) {
          e.preventDefault();
        }
      }}
    >
      <button
        type="submit"
        className="rounded-lg bg-red-50 px-3 py-1.5 font-medium text-red-600"
      >
        Supprimer
      </button>
    </form>
  );
}
