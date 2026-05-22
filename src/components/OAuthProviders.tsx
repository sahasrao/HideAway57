"use client";

import { useEffect, useState } from "react";
import { OAuthButtons } from "./OAuthButtons";

export function OAuthProviders({ callbackUrl }: { callbackUrl: string }) {
  const [googleEnabled, setGoogleEnabled] = useState<boolean | null>(null);

  useEffect(() => {
    fetch("/api/auth/providers")
      .then((r) => r.json())
      .then((data) => setGoogleEnabled(Boolean(data.google)))
      .catch(() => setGoogleEnabled(false));
  }, []);

  if (googleEnabled === null) return null;
  if (!googleEnabled) {
    return (
      <p className="mt-6 text-center text-xs text-[#8f98a0]">
        OAuth: set AUTH_GOOGLE_ID and AUTH_GOOGLE_SECRET in .env to enable Google
        sign-in.
      </p>
    );
  }

  return (
    <div className="mt-6">
      <OAuthButtons callbackUrl={callbackUrl} enabled={{ google: true }} />
    </div>
  );
}
