import type { Metadata } from "next";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";

export const metadata: Metadata = {
  title: "Mot de passe oublié — YanaTrust",
};

export default function MotDePasseOubliePage() {
  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-6 px-4 py-10">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-brand-green-dark">
          Mot de passe oublié
        </h1>
        <p className="mt-1 text-sm text-brand-ink/70">
          Indiquez votre e-mail, nous vous envoyons un lien de
          réinitialisation.
        </p>
      </div>

      <ForgotPasswordForm />
    </div>
  );
}
