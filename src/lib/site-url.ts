import "server-only";
import { headers } from "next/headers";

// Utilisé pour construire les liens de redirection e-mail (confirmation,
// réinitialisation de mot de passe). Préfère la variable d'environnement en
// production (fiable derrière un proxy), sinon déduit l'origine de la requête.
export async function getSiteUrl() {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  }

  const headerList = await headers();
  const host = headerList.get("x-forwarded-host") ?? headerList.get("host");
  const protocol = headerList.get("x-forwarded-proto") ?? "http";

  return `${protocol}://${host}`;
}
