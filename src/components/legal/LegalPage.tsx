import Link from "next/link";
import { ChevronLeft, TriangleAlert } from "lucide-react";
import { A_COMPLETER } from "@/lib/legal/pages";

/** Mise en page commune aux pages légales, pour qu'elles se ressemblent toutes. */
export function LegalPage({
  titre,
  miseAJour,
  brouillon = true,
  children,
}: {
  titre: string;
  miseAJour?: string;
  /**
   * Tant qu'un texte n'a pas été relu par une personne compétente et que les
   * informations d'identité de l'éditeur manquent, il est signalé comme
   * brouillon. Mieux vaut l'annoncer que laisser croire à un document opposable.
   */
  brouillon?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-5 px-4 py-8">
      <Link
        href="/"
        className="flex items-center gap-1 text-sm font-medium text-brand-green-dark"
      >
        <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        Retour à l&rsquo;accueil
      </Link>

      <h1 className="text-2xl font-bold text-brand-green-dark">{titre}</h1>

      {brouillon ? (
        <p className="flex items-start gap-2 rounded-xl bg-brand-gold/15 px-4 py-3 text-sm text-brand-ink/80">
          <TriangleAlert
            className="mt-0.5 h-4 w-4 shrink-0 text-brand-green-dark"
            aria-hidden="true"
          />
          <span>
            <strong>Document de travail.</strong> Ce texte décrit le
            fonctionnement réel de l&rsquo;application, mais il comporte des
            informations manquantes, signalées par{" "}
            <code className="rounded bg-brand-ink/10 px-1">{A_COMPLETER}</code>,
            et n&rsquo;a pas été relu par un juriste. Il doit être finalisé avant
            l&rsquo;ouverture au public.
          </span>
        </p>
      ) : null}

      {miseAJour ? (
        <p className="text-xs text-brand-ink/65">Dernière mise à jour : {miseAJour}</p>
      ) : null}

      <div className="flex flex-col gap-5 text-sm leading-relaxed text-brand-ink/80">
        {children}
      </div>
    </div>
  );
}

/** Section d'une page légale : un titre de niveau 2 et son contenu. */
export function LegalSection({
  titre,
  children,
}: {
  titre: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-base font-bold text-brand-ink">{titre}</h2>
      {children}
    </section>
  );
}

/** Information que seul l'éditeur du site peut fournir. */
export function AComplete({ children }: { children: React.ReactNode }) {
  return (
    <mark className="rounded bg-brand-gold/40 px-1 font-medium text-brand-ink">
      {A_COMPLETER} {children}
    </mark>
  );
}
