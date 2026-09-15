import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { BookingProposal } from "@/lib/supabase/database.types";

export type ProposalWithParties = BookingProposal & {
  provider: { id: string; first_name: string; last_name: string } | null;
  client: { id: string; first_name: string; last_name: string } | null;
};

const PARTIES_SELECT =
  "*, provider:profiles!booking_proposals_provider_id_fkey(id, first_name, last_name), client:profiles!booking_proposals_client_id_fkey(id, first_name, last_name)";

export async function getProposalsForConversation(
  conversationId: string,
): Promise<ProposalWithParties[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("booking_proposals")
    .select(PARTIES_SELECT)
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("getProposalsForConversation:", error.message);
    return [];
  }

  return data as unknown as ProposalWithParties[];
}

export async function getProposalById(id: string): Promise<ProposalWithParties | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("booking_proposals")
    .select(PARTIES_SELECT)
    .eq("id", id)
    .single();

  if (error) {
    console.error("getProposalById:", error.message);
    return null;
  }

  return data as unknown as ProposalWithParties;
}

export async function getMyPendingProposalsAsClient(): Promise<ProposalWithParties[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data, error } = await supabase
    .from("booking_proposals")
    .select(PARTIES_SELECT)
    .eq("client_id", user.id)
    .eq("status", "pending_client")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getMyPendingProposalsAsClient:", error.message);
    return [];
  }

  return data as unknown as ProposalWithParties[];
}
