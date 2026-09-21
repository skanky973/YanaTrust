/**
 * Met un texte en minuscules et retire ses accents, pour le comparer à la
 * colonne search_text de la base, produite par la fonction SQL sans_accents().
 *
 * Les deux doivent rester cohérentes : si l'une change, l'autre aussi. La
 * normalisation NFD sépare la lettre de son accent, que l'on supprime ensuite ;
 * elle couvre davantage de caractères que la table de correspondance SQL, ce
 * qui est sans conséquence — un terme normalisé plus finement ne fait que
 * mieux correspondre.
 */
export function sansAccents(valeur: string): string {
  return valeur
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();
}
