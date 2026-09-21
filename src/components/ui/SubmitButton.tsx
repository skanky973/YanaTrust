"use client";

import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/Button";

export function SubmitButton({
  children,
  pendingLabel,
  className,
  variant = "primary",
  disabled = false,
}: {
  children: React.ReactNode;
  pendingLabel: string;
  className?: string;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  /** Désactivation propre au formulaire, cumulée avec l'envoi en cours. */
  disabled?: boolean;
}) {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      variant={variant}
      disabled={pending || disabled}
      className={className}
      // L'état d'envoi est annoncé aux lecteurs d'écran : le seul changement
      // de libellé ne suffit pas à le signaler.
      aria-busy={pending}
    >
      {pending ? pendingLabel : children}
    </Button>
  );
}
