import type { Metadata } from "next";
import { RequestForm } from "@/components/requests/RequestForm";

export const metadata: Metadata = {
  title: "Publier une demande — YanaTrust",
};

export default function PublierDemandePage() {
  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-4 py-8">
      <div>
        <h1 className="text-2xl font-bold text-brand-green-dark">
          Publier une demande
        </h1>
        <p className="mt-1 text-sm text-brand-ink/70">
          Décrivez le service dont vous avez besoin, un prestataire vous
          contactera.
        </p>
      </div>

      <RequestForm />
    </div>
  );
}
