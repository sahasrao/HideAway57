"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { FormEvent, useState, useEffect } from "react";

export function Header({ onMenuOpen }: { onMenuOpen: () => void }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { status } = useSession();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");

  useEffect(() => {
    setQuery(searchParams.get("q") ?? "");
  }, [searchParams]);

  function handleSearch(e: FormEvent) {
    e.preventDefault();
    const q = query.trim();
    router.push(q ? `/?q=${encodeURIComponent(q)}` : "/");
  }

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-[#3a3a3a] bg-[#0a0a0a]/95 px-4 backdrop-blur sm:h-16 sm:gap-4 sm:px-6 lg:px-8">
      <button
        type="button"
        onClick={onMenuOpen}
        className="rounded-md p-2 text-[var(--teal)] hover:bg-[var(--teal)]/10 lg:hidden"
        aria-label="Open menu"
      >
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      <form onSubmit={handleSearch} className="min-w-0 flex-1">
        <div className="search-bar relative">
          <span className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-[#59a4ac]">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search"
            className="search-bar-input"
          />
        </div>
      </form>

      <div className="flex shrink-0 items-center gap-2">
        <Link
          href={status === "authenticated" ? "/profile" : "/login"}
          className="flex items-center gap-2 rounded-md border-2 border-[var(--teal)] px-3 py-2 text-sm font-semibold text-[var(--teal)] transition-colors hover:bg-[var(--teal)]/10 sm:px-4"
        >
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path d="M12 12a5 5 0 100-10 5 5 0 000 10zm0 2c-4.42 0-8 2.24-8 5v1h16v-1c0-2.76-3.58-5-8-5z" />
          </svg>
          <span className="hidden sm:inline">Profile</span>
        </Link>
      </div>
    </header>
  );
}
