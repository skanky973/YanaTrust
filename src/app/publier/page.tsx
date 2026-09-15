import type { Metadata } from "next";
import { LinkButton } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Publier — YanaTrust",
};

export default function PublierPage() {
  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-4 px-4 py-8">
      <h1 className="text-center text-2xl font-bold text-brand-green-dark">
        Que voulez-vous publier ?
      </h1>

      <LinkButton href="/publier/service" variant="primary">
        Proposer un service
      </LinkButton>

      <LinkButton href="/publier/demande" variant="secondary">
        Publier une demande
      </LinkButton>

      <LinkButton href="/demandes" variant="secondary">
        Parcourir les demandes ouvertes
      </LinkButton>
    </div>
  );
}
