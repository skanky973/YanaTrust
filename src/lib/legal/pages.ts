// Source unique des pages légales : le pied de page, les plans de site et les
// liens contextuels s'y réfèrent, pour qu'aucun lien ne pointe vers une page
// inexistante et qu'aucune page ne reste orpheline.

export type PageLegale = {
  href: string;
  titre: string;
  resume: string;
};

export const PAGES_LEGALES: PageLegale[] = [
  {
    href: "/mentions-legales",
    titre: "Mentions légales",
    resume: "Qui édite le site, qui l'héberge, comment nous joindre.",
  },
  {
    href: "/confidentialite",
    titre: "Politique de confidentialité",
    resume: "Quelles données sont collectées, pourquoi, et vos droits.",
  },
  {
    href: "/cgu",
    titre: "Conditions générales d'utilisation",
    resume: "Les règles d'usage de la plateforme.",
  },
  {
    href: "/cgv",
    titre: "Conditions générales de vente",
    resume: "Réservation, paiement et commission sur le covoiturage.",
  },
  {
    href: "/annulation-remboursement",
    titre: "Annulation et remboursement",
    resume: "Ce qui se passe quand un trajet est annulé.",
  },
  {
    href: "/cookies",
    titre: "Cookies et traceurs",
    resume: "Ce qui est déposé sur votre appareil, et pourquoi.",
  },
];

// Marqueur unique pour tout ce qui attend une information que seul l'éditeur
// du site peut fournir. Il rend ces manques visibles à l'écran plutôt que de
// les laisser passer pour du texte définitif, et permet de tous les retrouver
// d'une recherche dans le code.
export const A_COMPLETER = "[À COMPLÉTER]";
