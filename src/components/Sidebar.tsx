"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "./Logo";

const navItems = [
  { href: "/", label: "Games", icon: GamesIcon },
  { href: "/library", label: "Library", icon: LibraryIcon },
  { href: "/cart", label: "Cart", icon: CartIcon },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-30 flex h-full w-[302px] flex-col border-r border-[#3a3a3a] bg-[#141414] px-4 py-6">
      <Logo />
      <nav className="mt-10 flex flex-col gap-2">
        {navItems.map((item) => {
          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-semibold transition-colors ${
                active ? "text-[var(--teal)]" : "text-[var(--teal)]/80 hover:text-[var(--teal)]"
              }`}
            >
              <Icon />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

function GamesIcon() {
  return (
    <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M21 6H7L6 4H3v2h2l3.6 7.59-1.35 2.45a1 1 0 001.8 1.15L12 14h7v-2h-5.5l-1-2H19l1 2h2V6z" />
    </svg>
  );
}

function LibraryIcon() {
  return (
    <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M4 6H2v14a2 2 0 002 2h14v-2H4V6zm16-4H8a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V4a2 2 0 00-2-2zm0 14H8V4h12v12z" />
    </svg>
  );
}

function CartIcon() {
  return (
    <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M7 18a2 2 0 100 4 2 2 0 000-4zM17 18a2 2 0 100 4 2 2 0 000-4zM5 4h-1l-1 2h14l-2 7H8L6 4H5z" />
    </svg>
  );
}
