"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useEffect, type ReactNode } from "react";
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
        <div className="flex items-center justify-between gap-3">
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
        <nav className="mt-12 flex flex-col gap-6">
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
                className={`nav-link flex items-center gap-4 rounded-md px-3 py-1 transition-colors ${
                  active ? "text-[var(--teal)]" : "text-[var(--teal)]/85 hover:text-[var(--teal)]"
                }`}
              >
                <Icon />
                {item.label}
              </Link>
            );
          })}
        </nav>
        {status === "authenticated" && (
          <div className="mt-auto border-t border-[#3a3a3a] pt-6">
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: "/" })}
              className="nav-link flex w-full items-center gap-4 rounded-md px-3 py-1 text-white/80 transition-colors hover:bg-red-500/10 hover:text-red-400"
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

function NavIcon({ children }: { children: ReactNode }) {
  return (
    <svg
      className="h-7 w-7 shrink-0"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.25}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {children}
    </svg>
  );
}

function GamesIcon() {
  return (
    <NavIcon>
      <path d="M17.32 5H6.68a4 4 0 0 0-3.978 3.59C2.157 9.425 2 10.855 2 12.282 2 17.405 5.633 22 10 22h4c4.367 0 8-4.595 8-9.718 0-1.427-.157-2.857-.702-4.282A4 4 0 0 0 17.32 5z" />
      <path d="M6 12h4" />
      <path d="M8 10v4" />
      <circle cx="14.75" cy="10.75" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="18.25" cy="10.75" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="14.75" cy="14.25" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="18.25" cy="14.25" r="1.1" fill="currentColor" stroke="none" />
    </NavIcon>
  );
}

function LibraryIcon() {
  return (
    <NavIcon>
      <rect x="3.75" y="7.5" width="3.25" height="11.5" rx="0.75" />
      <rect x="8.25" y="7.5" width="3.25" height="11.5" rx="0.75" />
      <g transform="translate(11.5 8.5) rotate(-22)">
        <rect x="0" y="0" width="3.25" height="11.5" rx="0.75" />
      </g>
    </NavIcon>
  );
}

function CartIcon() {
  return (
    <NavIcon>
      <path d="M6 7h13l-1.2 6.5H7.2L6 7z" />
      <path d="M6 7 5 4H3" />
      <circle cx="9.5" cy="19" r="1.25" />
      <circle cx="16.5" cy="19" r="1.25" />
    </NavIcon>
  );
}

function LogoutIcon() {
  return (
    <NavIcon>
      <path d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15" />
      <path d="M18 12H9" />
      <path d="m21 9-3 3 3 3" />
    </NavIcon>
  );
}
