"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { FormEvent, useState, useEffect } from "react";

export function Header() {
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
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-6 border-b border-[#3a3a3a] bg-[#0a0a0a]/95 px-8 backdrop-blur">
      <div className="flex-1" />
      <form onSubmit={handleSearch} className="w-full max-w-md">
        <div className="relative">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--teal)]">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search"
            className="w-full rounded-md border-2 border-[var(--teal)] bg-[#1a1a1a] py-2 pl-10 pr-4 text-sm text-white placeholder:text-[var(--teal)]/60 focus:outline-none focus:ring-1 focus:ring-[var(--teal)]"
          />
        </div>
      </form>
      <div className="flex flex-1 justify-end">
        <Link
          href={status === "authenticated" ? "/profile" : "/login"}
          className="flex items-center gap-2 rounded-md border-2 border-[var(--teal)] px-4 py-2 text-sm font-semibold text-[var(--teal)] transition-colors hover:bg-[var(--teal)]/10"
        >
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path d="M12 12a5 5 0 100-10 5 5 0 000 10zm0 2c-4.42 0-8 2.24-8 5v1h16v-1c0-2.76-3.58-5-8-5z" />
          </svg>
          Profile
        </Link>
      </div>
    </header>
  );
}
