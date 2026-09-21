import type { Metadata } from "next";
import { LegalPage, LegalSection } from "@/components/legal/LegalPage";

export const metadata: Metadata = {
  title: "Cookies et traceurs — YanaTrust",
};

/**
 * Cette page repose sur une mesure et non sur une déclaration d'intention :
 * un navigateur a été lancé sur les pages publiques, en enregistrant tous les
 * hôtes contactés, tous les cookies déposés et tout le stockage local. Résultat :
 * aucun cookie, aucun stockage, aucun script tiers avant connexion.
 *
 * C'est ce constat qui justifie l'absence de bandeau de consentement. Si un
 * outil de mesure d'audience ou une intégration tierce était ajouté un jour,
 * il faudrait refaire cette mesure et, le cas échéant, mettre en place un
 * véritable gestionnaire de consentement.
 */
export default function CookiesPage() {
  return (
    <LegalPage titre="Cookies et traceurs" brouillon={false}>
      <LegalSection titre="Il n'y a pas de bandeau, et c'est volontaire">
        <p>
          YanaTrust ne dépose aucun cookie publicitaire, aucun traceur de
          mesure d&rsquo;audience et aucun outil d&rsquo;analyse comportementale.
          Aucun script de réseau social, de régie publicitaire ou de statistiques
          n&rsquo;est chargé.
        </p>
        <p>
          La réglementation n&rsquo;impose de recueillir un consentement que
          pour les traceurs qui ne sont pas strictement nécessaires au service.
          Comme nous n&rsquo;en utilisons aucun, vous demander votre accord
          n&rsquo;aurait rien à quoi se rapporter : ce serait une formalité
          vide, qui vous ferait cliquer pour rien.
        </p>
      </LegalSection>

      <LegalSection titre="Ce qui est réellement déposé">
        <p>
          <strong>Avant connexion :</strong> rien. Vous pouvez parcourir
          l&rsquo;accueil, la recherche et les trajets sans qu&rsquo;aucun
          cookie ni aucune donnée ne soit enregistré sur votre appareil.
        </p>
        <p>
          <strong>Après connexion :</strong> un cookie de session, déposé par
          notre prestataire technique Supabase. Il contient le jeton qui prouve
          que vous êtes bien connecté. Sans lui, vous seriez déconnecté à chaque
          page. Il relève des traceurs strictement nécessaires, exemptés de
          consentement, et disparaît lorsque vous vous déconnectez.
        </p>
        <p>
          <strong>Pendant un paiement :</strong> vous êtes redirigé vers les
          pages de Stripe, qui dépose ses propres cookies, nécessaires à la
          sécurité de la transaction et à la lutte contre la fraude. Ils sont
          déposés sur le domaine de Stripe, et relèvent de sa propre politique.
        </p>
      </LegalSection>

      <LegalSection titre="Comment le vérifier vous-même">
        <p>
          Dans votre navigateur, ouvrez les outils de développement (touche F12),
          onglet « Application » ou « Stockage ». Vous y constaterez
          qu&rsquo;aucun cookie n&rsquo;est présent tant que vous ne vous êtes
          pas connecté.
        </p>
      </LegalSection>

      <LegalSection titre="Si cela change">
        <p>
          Le jour où un outil de mesure d&rsquo;audience serait ajouté, cette
          page serait mise à jour et un véritable choix vous serait proposé,
          avec un refus aussi simple que l&rsquo;acceptation, et aucun traceur
          déposé avant votre accord.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
