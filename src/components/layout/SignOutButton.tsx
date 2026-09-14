"use client";

import { signOut } from "@/lib/actions/auth";
import { Button } from "@/components/ui/Button";

export function SignOutButton() {
  return (
    <form action={signOut}>
      <Button type="submit" variant="ghost">
        Se déconnecter
      </Button>
    </form>
  );
}
