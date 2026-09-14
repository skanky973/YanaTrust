import type { Metadata } from "next";
import { ServiceForm } from "@/components/services/ServiceForm";

export const metadata: Metadata = {
  title: "Publier un service — YanaTrust",
};

export default function PublierServicePage() {
  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-4 py-8">
      <div>
        <h1 className="text-2xl font-bold text-brand-green-dark">
          Publier un service
        </h1>
        <p className="mt-1 text-sm text-brand-ink/70">
          Décrivez le service que vous proposez aux habitants.
        </p>
      </div>

      <ServiceForm />
    </div>
  );
}
