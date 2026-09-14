import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getConversationForCurrentUser } from "@/lib/conversations/queries";
import { getMyReviewFor } from "@/lib/reviews/queries";
import { ReviewForm } from "@/components/reviews/ReviewForm";

export const metadata: Metadata = {
  title: "Laisser un avis — YanaTrust",
};

export default async function AvisPage({
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
    redirect(`/connexion?suivant=/messages/${id}/avis`);
  }

  const data = await getConversationForCurrentUser(id);

  if (!data || !data.otherParticipant) {
    notFound();
  }

  const existingReview = await getMyReviewFor(data.otherParticipant.id);

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-4 py-8">
      <h1 className="text-2xl font-bold text-brand-green-dark">
        Laisser un avis
      </h1>

      <ReviewForm
        providerId={data.otherParticipant.id}
        conversationId={data.conversation.id}
        providerName={`${data.otherParticipant.first_name} ${data.otherParticipant.last_name}`}
        existingReview={existingReview}
      />
    </div>
  );
}
