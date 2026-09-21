import type { Metadata } from "next";
import { LegalPage, LegalSection, AComplete } from "@/components/legal/LegalPage";

export const metadata: Metadata = {
  title: "Mentions légales — YanaTrust",
};

export default function MentionsLegalesPage() {
  return (
    <LegalPage titre="Mentions légales">
      <LegalSection titre="Éditeur du site">
        <p>
          Le site et l&rsquo;application YanaTrust sont édités par{" "}
          <AComplete>
            dénomination sociale, forme juridique, capital social, numéro SIREN
            ou SIRET, numéro de TVA intracommunautaire le cas échéant, et
            adresse du siège social
          </AComplete>
          .
        </p>
        <p>
          Directeur de la publication : <AComplete>nom et prénom</AComplete>.
        </p>
        <p>
          Contact : <AComplete>adresse e-mail et numéro de téléphone</AComplete>.
        </p>
        <p>
          Si l&rsquo;activité est exercée à titre individuel sans société, ces
          informations restent obligatoires : nom, prénom, adresse et numéro
          d&rsquo;inscription au registre applicable.
        </p>
      </LegalSection>

      <LegalSection titre="Hébergement">
        <p>
          L&rsquo;application est hébergée par Vercel Inc., 340 S Lemon Ave
          #4133, Walnut, CA 91789, États-Unis.
        </p>
        <p>
          Les données (comptes, annonces, messages, photos) sont stockées par
          Supabase Inc., 970 Toa Payoh North, Singapour, sur une infrastructure
          située en <AComplete>région du projet Supabase, à vérifier dans les réglages du projet</AComplete>.
        </p>
        <p>
          Les paiements sont traités par Stripe Payments Europe Limited, 25/28
          North Wall Quay, Dublin 1, Irlande.
        </p>
      </LegalSection>

      <LegalSection titre="Nature du service">
        <p>
          YanaTrust est une plateforme de mise en relation. Elle permet à des
          particuliers et à des prestataires de se trouver pour des services du
          quotidien, et à des conducteurs de proposer des places dans leur
          véhicule en partage de frais.
        </p>
        <p>
          YanaTrust n&rsquo;est pas partie aux contrats conclus entre ses
          utilisateurs. Elle ne réalise aucune prestation de service à domicile
          et n&rsquo;assure aucun transport.
        </p>
      </LegalSection>

      <LegalSection titre="Propriété intellectuelle">
        <p>
          Le nom YanaTrust, son logo et l&rsquo;interface du site sont protégés.
          Les textes, photos et descriptions publiés par les utilisateurs
          restent la propriété de leurs auteurs, qui autorisent YanaTrust à les
          afficher dans le cadre du service.
        </p>
      </LegalSection>

      <LegalSection titre="Signaler un contenu">
        <p>
          Chaque profil, service et message comporte un bouton de signalement.
          Les signalements sont examinés par l&rsquo;équipe de modération depuis
          un espace dédié.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
