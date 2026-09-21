import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage, LegalSection, AComplete } from "@/components/legal/LegalPage";

export const metadata: Metadata = {
  title: "Conditions générales d'utilisation — YanaTrust",
};

export default function CguPage() {
  return (
    <LegalPage titre="Conditions générales d'utilisation">
      <LegalSection titre="Objet">
        <p>
          YanaTrust met en relation des habitants de Saint-Laurent-du-Maroni et
          des environs : d&rsquo;un côté des personnes qui cherchent un service,
          de l&rsquo;autre des prestataires ; et, pour le covoiturage, des
          conducteurs et des passagers.
        </p>
        <p>
          YanaTrust n&rsquo;est pas partie aux accords conclus entre
          utilisateurs. Elle ne réalise aucune prestation et n&rsquo;effectue
          aucun transport.
        </p>
      </LegalSection>

      <LegalSection titre="Votre compte">
        <p>
          L&rsquo;inscription est réservée aux personnes majeures. Vous vous
          engagez à donner des informations exactes, notamment votre nom et
          votre photo, puisque c&rsquo;est sur elles que les autres utilisateurs
          fondent leur confiance.
        </p>
        <p>
          Une photo de profil est exigée avant de publier un service, de
          proposer un trajet ou de réserver une place. Elle n&rsquo;est pas
          demandée pour créer un compte ni pour consulter le site.
        </p>
        <p>
          Vous êtes responsable de la confidentialité de votre mot de passe et
          des actions effectuées depuis votre compte.
        </p>
      </LegalSection>

      <LegalSection titre="Ce que vous publiez">
        <p>
          Vous restez propriétaire de vos textes et de vos photos. Vous
          garantissez avoir le droit de les publier, et vous autorisez YanaTrust
          à les afficher dans le cadre du service.
        </p>
        <p>
          Sont interdits : les propos injurieux, discriminatoires ou
          diffamatoires, les contenus illicites, l&rsquo;usurpation
          d&rsquo;identité, les fausses annonces, les faux avis, et la
          publication des coordonnées d&rsquo;un tiers sans son accord.
        </p>
      </LegalSection>

      <LegalSection titre="Covoiturage : partage de frais uniquement">
        <p>
          Le covoiturage proposé sur YanaTrust est un partage de frais entre
          particuliers. Le prix demandé aux passagers ne doit pas dépasser la
          part des frais du trajet qui leur revient : carburant, péages, usure
          du véhicule. Le conducteur ne doit tirer aucun bénéfice du trajet.
        </p>
        <p>
          Un conducteur qui fixerait un prix supérieur exercerait une activité
          de transport de personnes, soumise à des obligations propres
          (inscription, licence, assurance adaptée). Il en serait seul
          responsable.
        </p>
        <p>
          Chaque conducteur doit disposer d&rsquo;un permis valide et d&rsquo;une
          assurance couvrant le transport de passagers à titre gratuit.
        </p>
      </LegalSection>

      <LegalSection titre="Prestataires">
        <p>
          Un prestataire déclare exercer son activité dans des conditions
          régulières et disposer des autorisations, qualifications et assurances
          exigées pour ce qu&rsquo;il propose. YanaTrust ne vérifie ni les
          diplômes, ni les assurances, ni les immatriculations.
        </p>
        <p>
          <AComplete>
            préciser si une vérification d&rsquo;immatriculation ou
            d&rsquo;assurance sera mise en place, et selon quelles modalités
          </AComplete>
        </p>
      </LegalSection>

      <LegalSection titre="Avis">
        <p>
          Un avis ne peut être laissé qu&rsquo;à une personne avec laquelle vous
          avez déjà échangé sur la plateforme. Les avis doivent rendre compte
          d&rsquo;une expérience réelle.
        </p>
      </LegalSection>

      <LegalSection titre="Modération">
        <p>
          Chaque profil, service et message peut être signalé. Les signalements
          sont examinés par l&rsquo;équipe de modération, qui peut masquer un
          contenu ou suspendre un compte en cas de manquement.
        </p>
      </LegalSection>

      <LegalSection titre="Responsabilité">
        <p>
          YanaTrust met à disposition un outil de mise en relation. La qualité
          des prestations, le déroulement des trajets et le respect des
          engagements pris relèvent des utilisateurs entre eux.
        </p>
        <p>
          YanaTrust reste responsable du bon fonctionnement technique du
          service, de la sécurité des données et du traitement des
          signalements.
        </p>
      </LegalSection>

      <LegalSection titre="Fin du contrat">
        <p>
          Vous pouvez supprimer votre compte à tout moment depuis{" "}
          <Link href="/profil/donnees" className="text-brand-green-dark underline">
            Mes données
          </Link>
          . YanaTrust peut suspendre un compte en cas de manquement grave aux
          présentes conditions.
        </p>
      </LegalSection>

      <LegalSection titre="Droit applicable et litiges">
        <p>
          Les présentes conditions sont soumises au droit français. En cas de
          litige, une solution amiable sera recherchée en premier lieu.
        </p>
        <p>
          <AComplete>
            coordonnées du médiateur de la consommation, dont le recours est
            obligatoire pour un professionnel s&rsquo;adressant à des
            consommateurs
          </AComplete>
        </p>
      </LegalSection>
    </LegalPage>
  );
}
