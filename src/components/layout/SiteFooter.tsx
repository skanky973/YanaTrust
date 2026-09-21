import Link from "next/link";
import { PAGES_LEGALES } from "@/lib/legal/pages";

/**
 * Pied de page présent sur toutes les pages. C'est l'emplacement où les
 * visiteurs cherchent les mentions légales et la politique de confidentialité ;
 * sans lui, ces pages existent sans être atteignables.
 *
 * La marge basse tient compte de la barre de navigation fixée en bas d'écran,
 * qui recouvrirait sinon les derniers liens.
 */
export function SiteFooter() {
  return (
    <footer className="mt-10 border-t border-brand-ink/10 px-4 pb-4 pt-6">
      <nav aria-label="Informations légales" className="mx-auto w-full max-w-md">
        <ul className="flex flex-wrap justify-center gap-x-4 gap-y-2">
          {PAGES_LEGALES.map(({ href, titre }) => (
            <li key={href}>
              <Link
                href={href}
                className="text-xs text-brand-ink/70 underline underline-offset-2"
              >
                {titre}
              </Link>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-center text-xs text-brand-ink/65">
          YanaTrust — Saint-Laurent-du-Maroni, Guyane
        </p>
      </nav>
    </footer>
  );
}
