import type { Metadata } from "next";
import { ComingSoon } from "@/components/layout/ComingSoon";

export const metadata: Metadata = {
  title: "Publier — YanaTrust",
};

export default function PublierPage() {
  return (
    <ComingSoon
      title="Publier un service ou une demande"
      description="Vous pourrez bientôt proposer vos services ou publier une demande depuis cette page."
    />
  );
}
