import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getMyConversations } from "@/lib/conversations/queries";

export const metadata: Metadata = {
  title: "Messages — YanaTrust",
};

function formatDate(timestamp: string) {
  return new Date(timestamp).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
  });
}

export default async function MessagesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/connexion?suivant=/messages");
  }

  const conversations = await getMyConversations();

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-4 py-8">
      <h1 className="text-2xl font-bold text-brand-green-dark">Messages</h1>

      {conversations.length === 0 ? (
        <p className="rounded-xl bg-white shadow-sm shadow-black/5 p-6 text-center text-sm text-brand-ink/70">
          Aucune conversation pour le moment. Contactez un prestataire depuis
          la page d&rsquo;un service pour démarrer une discussion.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {conversations.map((conversation) => (
            <Link
              key={conversation.id}
              href={`/messages/${conversation.id}`}
              className="flex items-center justify-between gap-3 rounded-xl bg-white shadow-sm shadow-black/5 p-4"
            >
              <div className="min-w-0">
                <p className="font-semibold text-brand-ink">
                  {conversation.otherParticipant
                    ? `${conversation.otherParticipant.first_name} ${conversation.otherParticipant.last_name}`
                    : "Utilisateur"}
                </p>
                <p className="truncate text-sm text-brand-ink/70">
                  {conversation.lastMessage?.content ?? "Nouvelle conversation"}
                </p>
              </div>
              {conversation.lastMessage ? (
                <span className="shrink-0 text-xs text-brand-ink/65">
                  {formatDate(conversation.lastMessage.created_at)}
                </span>
              ) : null}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
