"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { sendMessage } from "@/app/messages/[id]/actions";
import { INITIAL_ACTION_STATE } from "@/lib/actions/action-state";
import { ReportButton } from "@/components/reports/ReportButton";
import type { Message } from "@/lib/supabase/database.types";

function formatTime(timestamp: string) {
  return new Date(timestamp).toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function MessageThread({
  conversationId,
  currentUserId,
  initialMessages,
}: {
  conversationId: string;
  currentUserId: string;
  initialMessages: Message[];
}) {
  const [messages, setMessages] = useState(initialMessages);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const newMessage = payload.new as Message;
          setMessages((prev) =>
            prev.some((m) => m.id === newMessage.id) ? prev : [...prev, newMessage],
          );
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const sendMessageWithId = sendMessage.bind(null, conversationId);
  const [state, formAction] = useActionState(
    sendMessageWithId,
    INITIAL_ACTION_STATE,
  );

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-1 flex-col gap-2 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <p className="mt-8 text-center text-sm text-brand-ink/50">
            Aucun message pour le moment. Dites bonjour !
          </p>
        ) : (
          messages.map((message) => {
            const isOwn = message.sender_id === currentUserId;
            return (
              <div
                key={message.id}
                className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                  isOwn
                    ? "self-end rounded-br-sm bg-brand-green-dark text-brand-cream"
                    : "self-start rounded-bl-sm bg-white text-brand-ink"
                }`}
              >
                <p className="whitespace-pre-line text-sm">{message.content}</p>
                <p
                  className={`mt-1 text-[10px] ${
                    isOwn ? "text-brand-cream/70" : "text-brand-ink/40"
                  }`}
                >
                  {formatTime(message.created_at)}
                </p>
                {!isOwn ? (
                  <ReportButton
                    targetType="message"
                    targetId={message.id}
                    label="Signaler"
                    className="mt-1"
                  />
                ) : null}
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      <form
        action={formAction}
        key={messages.length}
        className="flex gap-2 border-t border-brand-ink/10 p-3"
      >
        <input
          name="content"
          required
          maxLength={4000}
          placeholder="Votre message..."
          autoComplete="off"
          className="flex-1 rounded-full border border-brand-ink/15 bg-white px-4 py-2 text-sm text-brand-ink placeholder:text-brand-ink/40 focus:border-brand-green focus:outline-none focus:ring-2 focus:ring-brand-green/30"
        />
        <button
          type="submit"
          className="rounded-full bg-brand-green-dark px-4 py-2 text-sm font-semibold text-brand-cream"
        >
          Envoyer
        </button>
      </form>
      {state.error ? (
        <p className="px-4 pb-2 text-xs text-red-600">{state.error}</p>
      ) : null}
    </div>
  );
}
