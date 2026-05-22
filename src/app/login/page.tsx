"use client";

import Link from "next/link";
import { OAuthProviders } from "@/components/OAuthProviders";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState, Suspense } from "react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Invalid email or password.");
      return;
    }

    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-md">
      <h1 className="page-title">Sign in</h1>
      <p className="mt-2 text-sm text-[var(--muted)]">Welcome back to HideAway 57</p>

      <form onSubmit={handleSubmit} className="panel mt-8 space-y-4 p-6">
        <div>
          <label htmlFor="email" className="block text-xs text-[#8f98a0]">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="mt-1 w-full rounded border border-[#555] bg-[#1a1a1a] px-3 py-2 text-white focus:border-[var(--teal)] focus:outline-none"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-xs text-[#8f98a0]">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="mt-1 w-full rounded border border-[#555] bg-[#1a1a1a] px-3 py-2 text-white focus:border-[var(--teal)] focus:outline-none"
          />
        </div>
        {error && (
          <p className="text-sm text-red-400" role="alert">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={loading}
          className="btn-teal w-full py-2.5 text-sm disabled:opacity-50"
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>

      <OAuthProviders callbackUrl={callbackUrl} />

      <p className="mt-6 text-center text-sm text-[#8f98a0]">
        No account?{" "}
        <Link
          href={`/register?callbackUrl=${encodeURIComponent(callbackUrl)}`}
          className="text-[var(--teal)] hover:underline"
        >
          Create one
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<p className="text-[#8f98a0]">Loading...</p>}>
      <LoginForm />
    </Suspense>
  );
}
