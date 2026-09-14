import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { BottomNav } from "@/components/layout/BottomNav";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "YanaTrust — Les services d'ici, en toute confiance",
    template: "%s",
  },
  description:
    "YanaTrust, la plateforme locale de services à Saint-Laurent-du-Maroni : trouvez un prestataire de confiance ou proposez vos services.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="fr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-brand-cream">
        <main className="flex flex-1 flex-col pb-20">{children}</main>
        <BottomNav />
      </body>
    </html>
  );
}
