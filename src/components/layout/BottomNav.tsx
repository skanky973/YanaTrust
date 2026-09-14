"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, PlusCircle, MessageCircle, User } from "lucide-react";

const NAV_ITEMS = [
  { href: "/", label: "Accueil", icon: Home },
  { href: "/recherche", label: "Recherche", icon: Search },
  { href: "/publier", label: "Publier", icon: PlusCircle },
  { href: "/messages", label: "Messages", icon: MessageCircle },
  { href: "/profil", label: "Profil", icon: User },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Navigation principale"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-brand-ink/10 bg-white/95 backdrop-blur"
    >
      <ul className="mx-auto flex max-w-md items-stretch justify-between px-2">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive =
            href === "/" ? pathname === "/" : pathname.startsWith(href);

          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                className={`flex flex-col items-center gap-1 py-2.5 text-xs font-medium ${
                  isActive ? "text-brand-green-dark" : "text-brand-ink/50"
                }`}
                aria-current={isActive ? "page" : undefined}
              >
                <Icon
                  className="h-6 w-6"
                  strokeWidth={isActive ? 2.5 : 2}
                  aria-hidden="true"
                />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
