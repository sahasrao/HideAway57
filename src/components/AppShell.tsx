"use client";

import { Suspense, useCallback, useState, type ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

export function AppShell({ children }: { children: ReactNode }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const openMobileNav = useCallback(() => setMobileNavOpen(true), []);
  const closeMobileNav = useCallback(() => setMobileNavOpen(false), []);

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Sidebar open={mobileNavOpen} onClose={closeMobileNav} />
      <div className="flex min-h-screen flex-col lg:ml-[302px]">
        <Suspense fallback={<header className="h-14 border-b border-[#3a3a3a] sm:h-16" />}>
          <Header onMenuOpen={openMobileNav} />
        </Suspense>
        <main className="flex-1 px-4 py-4 sm:px-6 sm:py-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
