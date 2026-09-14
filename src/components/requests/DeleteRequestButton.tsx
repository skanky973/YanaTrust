"use client";

import { deleteRequest } from "@/app/mes-demandes/actions";

export function DeleteRequestButton({ requestId }: { requestId: string }) {
  return (
    <form
      action={deleteRequest.bind(null, requestId)}
      onSubmit={(e) => {
        if (!confirm("Supprimer définitivement cette demande ?")) {
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
