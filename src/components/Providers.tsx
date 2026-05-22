"use client";

import { type ReactNode } from "react";
import { SessionProvider } from "next-auth/react";
import { StoreProvider } from "@/context/StoreContext";
import { AppShell } from "./AppShell";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <StoreProvider>
        <AppShell>{children}</AppShell>
      </StoreProvider>
    </SessionProvider>
  );
}
