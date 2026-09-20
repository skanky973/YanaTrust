// Réduit une image dans le navigateur avant de l'envoyer au serveur.
//
// Une photo prise au téléphone pèse couramment 1 à 5 Mo, pour être affichée
// dans un rond de 96 pixels. Sans réduction, chaque liste de prestataires fait
// télécharger plusieurs mégaoctets pour afficher quelques vignettes — c'est ce
// qui donne l'impression qu'une application est lente sans qu'on sache pourquoi,
// et en Guyane la connexion mobile n'est pas toujours confortable.
//
// La réduction est faite ici plutôt que sur le serveur : l'envoi lui-même
// devient léger, ce qui compte autant que l'affichage.

const COTE_MAX = 512;
const QUALITE = 0.85;

export async function compresserImage(
  file: File,
  coteMax = COTE_MAX,
): Promise<File> {
  // En cas d'échec (format exotique, navigateur récalcitrant), on renvoie le
  // fichier d'origine : mieux vaut une photo lourde que pas de photo.
  try {
    const bitmap = await createImageBitmap(file);

    const facteur = Math.min(1, coteMax / Math.max(bitmap.width, bitmap.height));

    // Image déjà assez petite : inutile de la réencoder, ce qui dégraderait
    // sa qualité sans rien gagner.
    if (facteur === 1 && file.size <= 200 * 1024) {
      bitmap.close();
      return file;
    }

    const largeur = Math.round(bitmap.width * facteur);
    const hauteur = Math.round(bitmap.height * facteur);

    const canvas = document.createElement("canvas");
    canvas.width = largeur;
    canvas.height = hauteur;

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      bitmap.close();
      return file;
    }

    ctx.drawImage(bitmap, 0, 0, largeur, hauteur);
    bitmap.close();

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", QUALITE),
    );

    if (!blob || blob.size >= file.size) return file;

    const nom = file.name.replace(/\.[^.]+$/, "") + ".jpg";
    return new File([blob], nom, { type: "image/jpeg" });
  } catch {
    return file;
  }
}
