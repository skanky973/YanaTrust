import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage, LegalSection, AComplete } from "@/components/legal/LegalPage";

export const metadata: Metadata = {
  title: "Politique de confidentialité — YanaTrust",
};

/**
 * Le contenu de cette page décrit les données réellement stockées par
 * l'application, relevées dans supabase/schema.sql et dans les formulaires.
 * Toute évolution du schéma doit être répercutée ici.
 */
export default function ConfidentialitePage() {
  return (
    <LegalPage titre="Politique de confidentialité">
      <LegalSection titre="Qui est responsable de vos données">
        <p>
          Le responsable du traitement est{" "}
          <AComplete>identité de l&rsquo;éditeur, voir les mentions légales</AComplete>
          . Pour toute question relative à vos données, écrivez à{" "}
          <AComplete>adresse e-mail de contact</AComplete>.
        </p>
      </LegalSection>

      <LegalSection titre="Ce que nous collectons, et pourquoi">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[34rem] border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-brand-ink/15">
                <th className="py-2 pr-3 font-semibold text-brand-ink">Donnée</th>
                <th className="py-2 pr-3 font-semibold text-brand-ink">Pourquoi</th>
                <th className="py-2 pr-3 font-semibold text-brand-ink">Obligatoire</th>
                <th className="py-2 font-semibold text-brand-ink">Base légale</th>
              </tr>
            </thead>
            <tbody className="align-top">
              {[
                ["Adresse e-mail et mot de passe", "Créer et sécuriser votre compte", "Oui", "Exécution du contrat"],
                ["Nom et prénom", "Vous identifier auprès des autres utilisateurs", "Oui", "Exécution du contrat"],
                ["Photo de profil", "Permettre de savoir à qui l'on a affaire. Exigée pour publier ou réserver", "Oui pour publier ou réserver", "Exécution du contrat"],
                ["Téléphone", "Vous joindre pour une intervention. Stocké à part et visible de vous seul", "Non", "Exécution du contrat"],
                ["Ville, zone d'intervention, biographie", "Être trouvé par les personnes proches de chez vous", "Non", "Exécution du contrat"],
                ["Annonces, demandes, photos de service", "Publier votre offre ou votre besoin", "Selon l'usage", "Exécution du contrat"],
                ["Messages échangés", "Vous permettre de vous organiser entre vous", "Selon l'usage", "Exécution du contrat"],
                ["Adresse d'intervention", "Permettre au prestataire de se rendre sur place", "Oui pour une intervention", "Exécution du contrat"],
                ["Trajets, réservations, montants payés", "Gérer les réservations et les paiements", "Oui pour le covoiturage", "Exécution du contrat et obligation comptable"],
                ["Avis et notes", "Informer les autres utilisateurs", "Non", "Intérêt légitime"],
                ["Signalements", "Modérer les contenus abusifs", "Non", "Intérêt légitime"],
                ["Journaux techniques du serveur", "Diagnostiquer les pannes et les abus", "Automatique", "Intérêt légitime"],
              ].map(([donnee, pourquoi, obligatoire, base]) => (
                <tr key={donnee} className="border-b border-brand-ink/8">
                  <td className="py-2 pr-3 font-medium text-brand-ink">{donnee}</td>
                  <td className="py-2 pr-3">{pourquoi}</td>
                  <td className="py-2 pr-3">{obligatoire}</td>
                  <td className="py-2">{base}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p>
          Nous ne collectons ni votre position GPS, ni vos contacts, ni aucune
          donnée sensible. Vos coordonnées bancaires ne transitent jamais par
          YanaTrust : elles sont saisies directement sur les pages de Stripe.
        </p>
      </LegalSection>

      <LegalSection titre="Qui peut voir quoi">
        <p>
          <strong>Public, y compris sans compte :</strong> votre nom, votre
          photo, votre ville, votre biographie, vos annonces et les avis reçus.
        </p>
        <p>
          <strong>Visible de vous seul :</strong> votre numéro de téléphone,
          votre adresse e-mail, vos réservations et vos notifications.
        </p>
        <p>
          <strong>Visible des deux parties uniquement :</strong> vos
          conversations, les adresses d&rsquo;intervention et les photos de
          chantier.
        </p>
        <p>
          Ces cloisonnements ne reposent pas seulement sur l&rsquo;affichage :
          ils sont appliqués par la base de données elle-même, qui refuse de
          renvoyer une ligne à quelqu&rsquo;un qui n&rsquo;y a pas droit.
        </p>
      </LegalSection>

      <LegalSection titre="À qui vos données sont transmises">
        <p>
          <strong>Supabase</strong> héberge la base de données et les fichiers.{" "}
          <strong>Stripe</strong> traite les paiements et reçoit, pour un
          conducteur qui encaisse, les informations d&rsquo;identité et
          bancaires exigées par la réglementation financière.{" "}
          <strong>Vercel</strong> héberge l&rsquo;application.
        </p>
        <p>
          Aucune donnée n&rsquo;est vendue ni transmise à des annonceurs. Aucun
          outil de mesure d&rsquo;audience ni réseau publicitaire n&rsquo;est
          installé.
        </p>
      </LegalSection>

      <LegalSection titre="Combien de temps nous les gardons">
        <p>
          <AComplete>
            durées de conservation à définir : compte actif et après
            suppression, messages, annonces, pièces comptables liées aux
            paiements, journaux techniques
          </AComplete>
        </p>
        <p>
          Ce que nous pouvons déjà indiquer : les pièces se rapportant à un
          paiement sont conservées pour répondre aux obligations comptables,
          même après la suppression d&rsquo;un compte.
        </p>
      </LegalSection>

      <LegalSection titre="Vos droits">
        <p>
          Vous disposez d&rsquo;un droit d&rsquo;accès, de rectification,
          d&rsquo;effacement, d&rsquo;opposition, de limitation et de
          portabilité.
        </p>
        <p>
          Deux de ces droits s&rsquo;exercent directement depuis
          l&rsquo;application, sans nous écrire :
        </p>
        <ul className="ml-4 list-disc space-y-1">
          <li>
            <strong>Rectification</strong> : depuis{" "}
            <Link href="/profil/modifier" className="text-brand-green-dark underline">
              Modifier mon profil
            </Link>
            .
          </li>
          <li>
            <strong>Accès et portabilité</strong> : depuis{" "}
            <Link href="/profil/donnees" className="text-brand-green-dark underline">
              Mes données
            </Link>
            , qui vous remet un fichier contenant tout ce que nous détenons sur
            vous.
          </li>
          <li>
            <strong>Effacement</strong> : depuis{" "}
            <Link href="/profil/donnees" className="text-brand-green-dark underline">
              Mes données
            </Link>{" "}
            également.
          </li>
        </ul>
        <p>
          Pour les autres droits, écrivez à{" "}
          <AComplete>adresse e-mail de contact</AComplete>. Vous pouvez également
          introduire une réclamation auprès de la CNIL, 3 place de Fontenoy,
          75007 Paris, ou sur cnil.fr.
        </p>
      </LegalSection>

      <LegalSection titre="Cookies">
        <p>
          YanaTrust n&rsquo;utilise aucun traceur publicitaire ni outil de
          mesure d&rsquo;audience. Le détail figure sur la page{" "}
          <Link href="/cookies" className="text-brand-green-dark underline">
            Cookies et traceurs
          </Link>
          .
        </p>
      </LegalSection>
    </LegalPage>
  );
}
