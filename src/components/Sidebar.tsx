"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useEffect } from "react";
import { Logo } from "./Logo";

const navItems = [
  { href: "/", label: "Games", icon: GamesIcon },
  { href: "/library", label: "Library", icon: LibraryIcon },
  { href: "/cart", label: "Cart", icon: CartIcon },
];

export function Sidebar({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();
  const { status } = useSession();

  useEffect(() => {
    onClose();
  }, [pathname, onClose]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <div
        className={`fixed inset-0 z-30 bg-black/60 backdrop-blur-sm transition-opacity lg:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
        aria-hidden={!open}
      />
      <aside
        className={`fixed left-0 top-0 z-40 flex h-full w-[min(302px,85vw)] flex-col border-r border-[#3a3a3a] bg-[#141414] px-4 py-6 transition-transform duration-200 ease-out lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex items-start justify-between gap-2">
          <Logo />
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-2 text-[var(--teal)] hover:bg-[var(--teal)]/10 lg:hidden"
            aria-label="Close menu"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
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
        {status === "authenticated" && (
          <div className="mt-auto border-t border-[#3a3a3a] pt-4">
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: "/" })}
              className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-semibold text-white/80 transition-colors hover:bg-red-500/10 hover:text-red-400"
            >
              <LogoutIcon />
              Log out
            </button>
          </div>
        )}
      </aside>
    </>
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

function LogoutIcon() {
  return (
    <svg className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1" />
    </svg>
  );
}
