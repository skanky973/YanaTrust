import type { Metadata } from "next";
import { LegalPage, LegalSection, AComplete } from "@/components/legal/LegalPage";

export const metadata: Metadata = {
  title: "Annulation et remboursement — YanaTrust",
};

/**
 * Chaque règle énoncée ici correspond à un comportement effectivement
 * implémenté : cancelTrip et cancelMyPaidBooking dans src/lib/actions/carpool.ts,
 * et refund_carpool_booking dans supabase/schema.sql. Rien n'est annoncé qui ne
 * soit exécuté par le code.
 */
export default function AnnulationRemboursementPage() {
  return (
    <LegalPage titre="Annulation et remboursement">
      <LegalSection titre="Si le conducteur annule le trajet">
        <p>
          Vous êtes <strong>intégralement remboursé</strong>, automatiquement,
          sans avoir à le demander. Le remboursement est déclenché au moment où
          le conducteur annule, et vous recevez une notification le confirmant.
        </p>
        <p>
          Le montant revient sur la carte utilisée lors du paiement. Le délai
          d&rsquo;apparition sur votre relevé dépend de votre banque, et prend
          généralement de cinq à dix jours.
        </p>
      </LegalSection>

      <LegalSection titre="Si vous vous désistez avant le départ">
        <p>
          Vous êtes <strong>intégralement remboursé</strong>. Le désistement
          s&rsquo;effectue depuis « Mes réservations », par le bouton « Me
          désister et être remboursé », visible tant que le trajet n&rsquo;est
          pas parti. Votre place est aussitôt remise à la disposition
          d&rsquo;autres passagers.
        </p>
      </LegalSection>

      <LegalSection titre="Après l'heure de départ">
        <p>
          Le désistement n&rsquo;est plus possible et aucun remboursement
          n&rsquo;est effectué : la place a été immobilisée pour vous et le
          conducteur a assuré le trajet.
        </p>
      </LegalSection>

      <LegalSection titre="Si la réservation n'a pas encore été payée">
        <p>
          Vous pouvez l&rsquo;annuler librement, et la place est rendue. Une
          réservation dont le paiement n&rsquo;aboutit pas est annulée
          automatiquement.
        </p>
      </LegalSection>

      <LegalSection titre="En cas de difficulté">
        <p>
          Si un remboursement automatique échoue, vous en êtes informé par une
          notification vous invitant à nous contacter, et le remboursement est
          alors traité manuellement.
        </p>
        <p>
          Pour tout litige avec un conducteur — trajet non effectué, retard
          important, comportement inapproprié — écrivez à{" "}
          <AComplete>adresse e-mail de contact</AComplete>.
        </p>
      </LegalSection>

      <LegalSection titre="Droit de rétractation">
        <p>
          <AComplete>
            analyse juridique à faire valider : le droit de rétractation de
            quatorze jours comporte des exceptions, notamment pour les services
            de transport de personnes fournis à une date déterminée. Il faut
            établir si le covoiturage entre particuliers relève de cette
            exception, et si YanaTrust agit comme professionnel vis-à-vis du
            passager
          </AComplete>
        </p>
        <p>
          En l&rsquo;état, les règles ci-dessus sont celles réellement
          appliquées par l&rsquo;application. Elles sont plus favorables au
          passager qu&rsquo;une simple absence de remboursement, mais elles ne
          préjugent pas de l&rsquo;analyse juridique qui reste à conduire.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
