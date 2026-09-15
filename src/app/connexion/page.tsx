import type { Metadata } from "next";
import Link from "next/link";
import { SignInForm } from "@/components/auth/SignInForm";
import { YanaTrustMark } from "@/components/brand/YanaTrustMark";

export const metadata: Metadata = {
  title: "Connexion — YanaTrust",
};

export default async function ConnexionPage({
  searchParams,
}: {
  searchParams: Promise<{ suivant?: string }>;
}) {
  const { suivant } = await searchParams;

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-6 px-4 py-10">
      <div className="flex flex-col items-center text-center">
        <YanaTrustMark className="mb-3 h-14 w-14" />
        <h1 className="text-2xl font-bold text-brand-green-dark">
          Bon retour
        </h1>
        <p className="mt-1 text-sm text-brand-ink/70">
          Connectez-vous à votre compte YanaTrust.
        </p>
      </div>

      <SignInForm next={suivant} />

      <p className="text-center text-sm text-brand-ink/70">
        Pas encore de compte ?{" "}
        <Link
          href="/inscription"
          className="font-semibold text-brand-green-dark"
        >
          S&rsquo;inscrire
        </Link>
      </p>
    </div>
  );
}
