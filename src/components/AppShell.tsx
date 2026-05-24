"use client";

import { Suspense, type ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Sidebar />
      <div className="ml-[302px] flex min-h-screen flex-col">
        <Suspense fallback={<header className="h-16 border-b border-[#3a3a3a]" />}>
          <Header />
        </Suspense>
        <main className="flex-1 px-8 py-6">{children}</main>
      </div>
    </div>
  );
}
