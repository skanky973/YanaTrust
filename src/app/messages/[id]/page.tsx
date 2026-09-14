import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getConversationForCurrentUser } from "@/lib/conversations/queries";
import { MessageThread } from "@/components/messages/MessageThread";

export const metadata: Metadata = {
  title: "Conversation — YanaTrust",
};

export default async function ConversationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/connexion?suivant=/messages/${id}`);
  }

  const data = await getConversationForCurrentUser(id);

  if (!data) {
    notFound();
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col">
      <div className="flex items-center gap-3 border-b border-brand-ink/10 bg-white px-4 py-3">
        <Link href="/messages" className="text-brand-green-dark" aria-label="Retour aux messages">
          ←
        </Link>
        <h1 className="flex-1 font-semibold text-brand-ink">
          {data.otherParticipant
            ? `${data.otherParticipant.first_name} ${data.otherParticipant.last_name}`
            : "Conversation"}
        </h1>
        {data.otherParticipant ? (
          <Link
            href={`/messages/${id}/avis`}
            className="shrink-0 text-xs font-semibold text-brand-green-dark"
          >
            Laisser un avis
          </Link>
        ) : null}
      </div>

      <MessageThread
        conversationId={data.conversation.id}
        currentUserId={data.currentUserId}
        initialMessages={data.messages}
      />
    </div>
  );
}
