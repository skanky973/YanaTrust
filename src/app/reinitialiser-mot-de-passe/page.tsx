import type { Metadata } from "next";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";

export const metadata: Metadata = {
  title: "Réinitialiser le mot de passe — YanaTrust",
};

export default function ReinitialiserMotDePassePage() {
  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-6 px-4 py-10">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-brand-green-dark">
          Nouveau mot de passe
        </h1>
        <p className="mt-1 text-sm text-brand-ink/70">
          Choisissez un nouveau mot de passe pour votre compte.
        </p>
      </div>

      <ResetPasswordForm />
    </div>
  );
}
