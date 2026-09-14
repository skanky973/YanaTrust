import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/profiles/queries";
import { ProfileForm } from "@/components/profile/ProfileForm";

export const metadata: Metadata = {
  title: "Modifier mon profil — YanaTrust",
};

export default async function ModifierProfilPage() {
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect("/connexion?suivant=/profil/modifier");
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-4 py-8">
      <h1 className="text-2xl font-bold text-brand-green-dark">
        Modifier mon profil
      </h1>

      <ProfileForm profile={profile} />
    </div>
  );
}
