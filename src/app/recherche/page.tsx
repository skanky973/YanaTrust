import type { Metadata } from "next";
import { ComingSoon } from "@/components/layout/ComingSoon";

export const metadata: Metadata = {
  title: "Recherche — YanaTrust",
};

export default function RecherchePage() {
  return (
    <ComingSoon
      title="Recherche de prestataires"
      description="La recherche de services et de prestataires près de chez vous arrive très bientôt."
    />
  );
}
