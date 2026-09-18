"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, Plus, Car, MessageCircle, User } from "lucide-react";

const NAV_ITEMS = [
  { href: "/", label: "Accueil", icon: Home },
  { href: "/recherche", label: "Recherche", icon: Search },
  { href: "/publier", label: "Publier", icon: Plus, isCenter: true },
  { href: "/covoiturage", label: "Trajets", icon: Car },
  { href: "/messages", label: "Messages", icon: MessageCircle },
  { href: "/profil", label: "Profil", icon: User },
];

export function BottomNav({ unreadCount = 0 }: { unreadCount?: number }) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Navigation principale"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-brand-ink/10 bg-white/95 backdrop-blur"
    >
      <ul className="mx-auto flex max-w-md items-stretch justify-between px-2">
        {NAV_ITEMS.map(({ href, label, icon: Icon, isCenter }) => {
          const isActive =
            href === "/" ? pathname === "/" : pathname.startsWith(href);

          if (isCenter) {
            return (
              <li key={href} className="flex-1">
                <Link
                  href={href}
                  className="flex flex-col items-center gap-1 py-2.5 text-xs font-medium text-brand-green-dark"
                  aria-current={isActive ? "page" : undefined}
                >
                  <span className="-mt-6 flex h-12 w-12 items-center justify-center rounded-full bg-brand-green-dark text-brand-cream shadow-md shadow-brand-green-dark/30">
                    <Icon className="h-6 w-6" strokeWidth={2.5} aria-hidden="true" />
                  </span>
                  {label}
                </Link>
              </li>
            );
          }

          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                className={`flex flex-col items-center gap-1 py-2.5 text-xs font-medium ${
                  isActive ? "text-brand-green-dark" : "text-brand-ink/50"
                }`}
                aria-current={isActive ? "page" : undefined}
              >
                <span className="relative">
                  <Icon
                    className="h-6 w-6"
                    strokeWidth={isActive ? 2.5 : 2}
                    aria-hidden="true"
                  />
                  {href === "/profil" && unreadCount > 0 ? (
                    <span
                      className="absolute -right-1.5 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white"
                      aria-label={`${unreadCount} notification${unreadCount > 1 ? "s" : ""} non lue${unreadCount > 1 ? "s" : ""}`}
                    >
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  ) : null}
                </span>
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
