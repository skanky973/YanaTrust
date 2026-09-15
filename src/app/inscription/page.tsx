import type { Metadata } from "next";
import Link from "next/link";
import { SignUpForm } from "@/components/auth/SignUpForm";
import { YanaTrustMark } from "@/components/brand/YanaTrustMark";

export const metadata: Metadata = {
  title: "Inscription — YanaTrust",
};

export default function InscriptionPage() {
  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-6 px-4 py-10">
      <div className="flex flex-col items-center text-center">
        <YanaTrustMark className="mb-3 h-14 w-14" />
        <h1 className="text-2xl font-bold text-brand-green-dark">
          Rejoindre YanaTrust
        </h1>
        <p className="mt-1 text-sm text-brand-ink/70">
          Les services d&rsquo;ici, en toute confiance.
        </p>
      </div>

      <SignUpForm />

      <p className="text-center text-sm text-brand-ink/70">
        Déjà un compte ?{" "}
        <Link href="/connexion" className="font-semibold text-brand-green-dark">
          Se connecter
        </Link>
      </p>
    </div>
  );
}
