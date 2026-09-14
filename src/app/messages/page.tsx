import type { Metadata } from "next";
import { ComingSoon } from "@/components/layout/ComingSoon";

export const metadata: Metadata = {
  title: "Messages — YanaTrust",
};

export default function MessagesPage() {
  return (
    <ComingSoon
      title="Messagerie"
      description="La messagerie entre clients et prestataires arrive dans une prochaine phase."
    />
  );
}
