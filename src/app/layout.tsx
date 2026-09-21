import type { Metadata } from "next";
import localFont from "next/font/local";
import { BottomNav } from "@/components/layout/BottomNav";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { getUnreadNotificationCount } from "@/lib/notifications/queries";
import "./globals.css";

// Poppins est servie depuis le projet plutôt que depuis Google Fonts. Trois
// raisons : le téléchargement au build échouait ici et la police de secours
// prenait sa place ; un appel au navigateur vers fonts.gstatic.com transmet
// l'adresse IP de chaque visiteur à Google, ce que le RGPD n'admet pas sans
// consentement ; et un fichier servi avec le site charge plus vite.
// Sous-ensemble latin uniquement : il couvre les accents français (é è à ç
// ô û î ù) ainsi que le œ. 5 fichiers, 38 Ko au total.
const poppins = localFont({
  variable: "--font-poppins",
  display: "swap",
  src: [
    { path: "./fonts/poppins-400.woff2", weight: "400", style: "normal" },
    { path: "./fonts/poppins-500.woff2", weight: "500", style: "normal" },
    { path: "./fonts/poppins-600.woff2", weight: "600", style: "normal" },
    { path: "./fonts/poppins-700.woff2", weight: "700", style: "normal" },
    { path: "./fonts/poppins-800.woff2", weight: "800", style: "normal" },
  ],
});

export const metadata: Metadata = {
  title: {
    default: "YanaTrust — Les services d'ici, en toute confiance",
    template: "%s",
  },
  description:
    "YanaTrust, la plateforme locale de services à Saint-Laurent-du-Maroni : trouvez un prestataire de confiance ou proposez vos services.",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const unreadCount = await getUnreadNotificationCount();

  return (
    <html lang="fr" className={`${poppins.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-brand-cream">
        {/* Lien d'évitement : invisible jusqu'à ce qu'il reçoive le focus, il
            permet à qui navigue au clavier d'atteindre le contenu sans
            parcourir toute l'interface. */}
        <a
          href="#contenu"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-xl focus:bg-brand-green-dark focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-brand-cream"
        >
          Aller au contenu principal
        </a>
        <main id="contenu" className="flex flex-1 flex-col">
          {children}
        </main>
        <div className="pb-24">
          <SiteFooter />
        </div>
        <BottomNav unreadCount={unreadCount} />
      </body>
    </html>
  );
}
