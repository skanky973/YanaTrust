import { type NextRequest, NextResponse } from "next/server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { EmailOtpType } from "@supabase/supabase-js";

function isSafeRedirectPath(path: string): boolean {
  return path.startsWith("/") && !path.startsWith("//");
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const nextParam = searchParams.get("next") ?? "/";
  const next = isSafeRedirectPath(nextParam) ? nextParam : "/";

  if (tokenHash && type) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash: tokenHash,
    });

    if (!error) {
      redirect(next);
    }
  }

  return NextResponse.redirect(
    new URL("/connexion?erreur=lien_invalide", request.url),
  );
}
