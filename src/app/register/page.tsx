"use client";

import Link from "next/link";
import { OAuthProviders } from "@/components/OAuthProviders";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState, Suspense } from "react";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/";
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(
        typeof data.error === "string"
          ? data.error
          : "Registration failed. Check your details."
      );
      setLoading(false);
      return;
    }

    const signInResult = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (signInResult?.error) {
      router.push("/login");
      return;
    }

    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-md">
      <h1 className="page-title">Create account</h1>
      <p className="mt-2 text-sm text-[var(--muted)]">
        Join HideAway 57 to buy games and build your library
      </p>

      <form onSubmit={handleSubmit} className="panel mt-8 space-y-4 p-6">
        <div>
          <label htmlFor="name" className="block text-xs text-[#8f98a0]">
            Display name
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="mt-1 w-full rounded border border-[#555] bg-[#1a1a1a] px-3 py-2 text-white focus:border-[var(--teal)] focus:outline-none"
          />
        </div>
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
            Password (min 8 characters)
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={8}
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
          {loading ? "Creating account..." : "Create account"}
        </button>
      </form>

      <OAuthProviders callbackUrl={callbackUrl} />

      <p className="mt-6 text-center text-sm text-[#8f98a0]">
        Already have an account?{" "}
        <Link
          href={`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`}
          className="text-[var(--teal)] hover:underline"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<p className="text-[#8f98a0]">Loading...</p>}>
      <RegisterForm />
    </Suspense>
  );
}
