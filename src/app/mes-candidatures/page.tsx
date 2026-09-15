import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getMyApplications } from "@/lib/applications/queries";
import { getApplicationStatusLabel, getApplicationStatusColor } from "@/lib/applications/status";

export const metadata: Metadata = {
  title: "Mes candidatures — YanaTrust",
};

export default async function MesCandidaturesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/connexion?suivant=/mes-candidatures");
  }

  const applications = await getMyApplications();

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-4 py-8">
      <h1 className="text-2xl font-bold text-brand-green-dark">Mes candidatures</h1>

      {applications.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl bg-white shadow-sm shadow-black/5 p-8 text-center">
          <p className="text-sm text-brand-ink/60">
            Vous n&rsquo;avez encore postulé à aucune demande.
          </p>
          <Link
            href="/demandes"
            className="rounded-xl bg-brand-green-dark px-4 py-2 text-sm font-semibold text-brand-cream"
          >
            Parcourir les demandes
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {applications.map((application) => (
            <Link
              key={application.id}
              href={
                application.status === "accepted_for_discussion" && application.conversation_id
                  ? `/messages/${application.conversation_id}`
                  : `/demandes/${application.request_id}`
              }
              className="flex flex-col gap-2 rounded-xl bg-white shadow-sm shadow-black/5 p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <h2 className="font-semibold text-brand-ink">
                  {application.request?.title ?? "Demande"}
                </h2>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${getApplicationStatusColor(application.status)}`}
                >
                  {getApplicationStatusLabel(application.status)}
                </span>
              </div>
              <p className="line-clamp-2 text-sm text-brand-ink/70">{application.message}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
