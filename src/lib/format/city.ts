// Les villes sont saisies au clavier, sans contrôle de casse : on trouve en
// base « SAINT LAURENT DU MARONI » aussi bien que « cayenne ». Les afficher
// telles quelles donne du texte qui crie et casse la lecture.
//
// Le formatage est fait à l'affichage et non à l'enregistrement : la donnée
// saisie reste intacte, et la recherche continue de fonctionner (elle compare
// sans tenir compte de la casse).

const PARTICULES = new Set([
  "de", "du", "des", "d", "la", "le", "les", "l",
  "au", "aux", "sur", "sous", "en", "et", "lès",
]);

export function formatCity(value: string | null | undefined): string {
  if (!value) return "";

  return value
    .trim()
    .toLocaleLowerCase("fr-FR")
    // Le groupe capturant conserve les séparateurs, pour que « Saint-Laurent »
    // garde son trait d'union et « Saint Laurent » son espace.
    .split(/([\s-]+)/)
    .map((part, index) => {
      if (!part || /^[\s-]+$/.test(part)) return part;
      // Une particule reste en minuscules, sauf en tête de nom : on écrit
      // « Saint-Laurent-du-Maroni », mais « Le Lamentin ».
      if (index > 0 && PARTICULES.has(part)) return part;
      return part.charAt(0).toLocaleUpperCase("fr-FR") + part.slice(1);
    })
    .join("");
}
