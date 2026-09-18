import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getMyNotifications } from "@/lib/notifications/queries";
import { openNotification } from "@/lib/actions/notifications";

export const metadata: Metadata = {
  title: "Notifications — YanaTrust",
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function NotificationsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/connexion?suivant=/notifications");
  }

  const notifications = await getMyNotifications();

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col gap-4 px-4 py-8">
      <h1 className="text-2xl font-bold text-brand-green-dark">Notifications</h1>

      {notifications.length === 0 ? (
        <p className="rounded-xl bg-white shadow-sm shadow-black/5 p-6 text-center text-sm text-brand-ink/70">
          Aucune notification pour le moment.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {notifications.map((n) => (
            <form key={n.id} action={openNotification.bind(null, n.id)}>
              <button
                type="submit"
                className={`w-full rounded-xl p-4 text-left shadow-sm shadow-black/5 ${
                  n.read ? "bg-white" : "bg-brand-green/10"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-semibold text-brand-ink">{n.title}</p>
                  {!n.read ? (
                    <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-brand-green-dark" />
                  ) : null}
                </div>
                {n.body ? (
                  <p className="mt-1 text-sm text-brand-ink/70">{n.body}</p>
                ) : null}
                <p className="mt-1 text-xs text-brand-ink/65">
                  {formatDate(n.created_at)}
                </p>
              </button>
            </form>
          ))}
        </div>
      )}
    </div>
  );
}
