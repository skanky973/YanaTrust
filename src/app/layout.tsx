import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import { BottomNav } from "@/components/layout/BottomNav";
import { getUnreadNotificationCount } from "@/lib/notifications/queries";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
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
        <main className="flex flex-1 flex-col pb-24">{children}</main>
        <BottomNav unreadCount={unreadCount} />
      </body>
    </html>
  );
}
