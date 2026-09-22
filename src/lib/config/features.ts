import "server-only";

/**
 * Interrupteur des réservations payantes de covoiturage.
 *
 * Pourquoi il existe : l'article L3132-1 du code des transports définit le
 * covoiturage comme un trajet « à titre non onéreux, excepté le partage des
 * frais, dans le cadre d'un déplacement que le conducteur effectue pour son
 * propre compte ». Le décret n° 2020-678 du 5 juin 2020 énumère les frais
 * partageables — dépréciation, réparation et entretien, pneumatiques,
 * carburant, primes d'assurance — et permet de les évaluer par le barème
 * kilométrique fiscal.
 *
 * Il en découle un plafond que l'application ne sait pas encore calculer :
 * le total perçu auprès de l'ensemble des passagers ne doit pas dépasser la
 * part des frais qui leur revient, le conducteur devant conserver la sienne.
 * Ce calcul suppose de connaître la distance du trajet et la puissance fiscale
 * du véhicule, deux informations que l'application ne collecte pas.
 *
 * Tant que ce plafond n'est pas implémenté, un conducteur peut fixer un prix
 * qui le ferait basculer dans le transport rémunéré de personnes — activité
 * soumise à licence, et qui prive son assurance d'effet en cas d'accident.
 *
 * L'interrupteur permet d'ouvrir la bêta sur les services sans exposer
 * personne à ce risque. Il se règle par la variable d'environnement
 * COVOITURAGE_PAIEMENT : « actif » l'autorise, toute autre valeur ou son
 * absence le bloque. Le défaut est donc le refus, ce qui est le bon sens
 * quand l'enjeu est une responsabilité pénale et assurantielle.
 */
export function paiementCovoiturageActif(): boolean {
  return process.env.COVOITURAGE_PAIEMENT === "actif";
}

export const COVOITURAGE_DESACTIVE_MESSAGE =
  "Les réservations payantes de covoiturage sont momentanément suspendues. " +
  "Le partage de frais doit respecter un plafond légal que nous finalisons. " +
  "Vous pouvez continuer à consulter les trajets et à contacter les conducteurs.";
