import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage, LegalSection, AComplete } from "@/components/legal/LegalPage";

export const metadata: Metadata = {
  title: "Conditions générales de vente — YanaTrust",
};

/**
 * Ces conditions ne couvrent que le seul flux payant de l'application : la
 * réservation d'une place de covoiturage. Les prestations de services sont
 * convenues et réglées directement entre utilisateurs, hors plateforme.
 * Les montants cités (commission de 10 %) sont ceux réellement appliqués par
 * create_carpool_booking dans supabase/schema.sql.
 */
export default function CgvPage() {
  return (
    <LegalPage titre="Conditions générales de vente">
      <LegalSection titre="Ce que couvrent ces conditions">
        <p>
          Elles s&rsquo;appliquent à la réservation payante d&rsquo;une place de
          covoiturage, qui est aujourd&rsquo;hui le seul paiement encaissé par
          YanaTrust.
        </p>
        <p>
          Les prestations de services (ménage, bricolage, réparation…) sont
          convenues et réglées directement entre le client et le prestataire.
          YanaTrust n&rsquo;encaisse rien sur ces prestations et n&rsquo;est pas
          partie au contrat.
        </p>
      </LegalSection>

      <LegalSection titre="Le prix et ce qu'il comprend">
        <p>
          Le prix par place est fixé librement par le conducteur, dans la limite
          du partage de frais rappelé dans les{" "}
          <Link href="/cgu" className="text-brand-green-dark underline">
            conditions d&rsquo;utilisation
          </Link>
          . Le montant total affiché avant paiement correspond au prix par place
          multiplié par le nombre de places réservées. Aucun frais ne
          s&rsquo;ajoute pour le passager.
        </p>
        <p>
          Sur chaque réservation payée, YanaTrust prélève une commission de{" "}
          <strong>10 % du montant réglé par le passager</strong>. Le solde,
          soit 90 %, est reversé au conducteur. Pour une place à 25 €, cela
          représente 2,50 € pour YanaTrust et 22,50 € pour le conducteur.
        </p>
      </LegalSection>

      <LegalSection titre="Comment se déroule le paiement">
        <p>
          La place est retenue dès la réservation, avant même le paiement, afin
          qu&rsquo;elle ne puisse pas être prise par quelqu&rsquo;un
          d&rsquo;autre pendant que vous réglez.
        </p>
        <p>
          Le paiement s&rsquo;effectue par carte bancaire sur les pages
          sécurisées de Stripe. Vos coordonnées bancaires ne transitent jamais
          par YanaTrust et n&rsquo;y sont jamais enregistrées.
        </p>
        <p>
          Si le paiement n&rsquo;aboutit pas, la place est automatiquement
          remise à la vente et la réservation annulée. La réservation
          n&rsquo;est confirmée qu&rsquo;une fois le paiement encaissé.
        </p>
      </LegalSection>

      <LegalSection titre="Reversement au conducteur">
        <p>
          Pour encaisser, un conducteur doit avoir activé ses paiements, ce qui
          suppose la création d&rsquo;un compte Stripe et la transmission à
          Stripe des informations d&rsquo;identité et des coordonnées bancaires
          exigées par la réglementation financière.
        </p>
        <p>
          <AComplete>
            délai de versement des fonds au conducteur, à confirmer dans les
            réglages Stripe
          </AComplete>
        </p>
      </LegalSection>

      <LegalSection titre="Annulation et remboursement">
        <p>
          Les règles sont détaillées sur la page{" "}
          <Link
            href="/annulation-remboursement"
            className="text-brand-green-dark underline"
          >
            Annulation et remboursement
          </Link>
          .
        </p>
      </LegalSection>

      <LegalSection titre="Facturation">
        <p>
          <AComplete>
            préciser si une facture de commission est émise au conducteur et
            sous quelle forme, ainsi que le régime de TVA applicable
          </AComplete>
        </p>
      </LegalSection>

      <LegalSection titre="Réclamations">
        <p>
          Pour toute réclamation relative à un paiement, écrivez à{" "}
          <AComplete>adresse e-mail de contact</AComplete>.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
