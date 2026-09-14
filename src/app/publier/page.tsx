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

      <div className="flex flex-col items-center gap-2 rounded-xl bg-white p-6 text-center">
        <p className="text-sm text-brand-ink/60">
          Publier une demande de service arrive bientôt.
        </p>
        <span className="rounded-full bg-brand-gold/30 px-3 py-1 text-xs font-semibold text-brand-green-dark">
          Bientôt disponible
        </span>
      </div>
    </div>
  );
}
