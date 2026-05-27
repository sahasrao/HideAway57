"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { FormEvent, useEffect, useState } from "react";

interface Profile {
  id: string;
  name: string | null;
  email: string;
  orderCount: number;
  libraryCount: number;
  systemRank: number;
  xpLevel: number;
  skillRank: string;
  coins: number;
  achievementCount: number;
}

export default function ProfilePage() {
  const { data: session, status, update } = useSession();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileError, setProfileError] = useState("");
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);

  useEffect(() => {
    if (status === "loading") return;

    if (status !== "authenticated") {
      setProfile(null);
      setLoadingProfile(false);
      return;
    }

    let cancelled = false;
    setLoadingProfile(true);
    setProfileError("");

    fetch("/api/profile")
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error ?? "Failed to load profile");
        }
        return data;
      })
      .then((data) => {
        if (cancelled || !data.id) return;
        setProfile(data);
        setName(data.name ?? "Player");
      })
      .catch((err: Error) => {
        if (!cancelled) {
          setProfile(null);
          setProfileError(err.message);
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingProfile(false);
      });

    return () => {
      cancelled = true;
    };
  }, [status]);

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    if (res.ok) {
      const data = await res.json();
      setProfile((p) => (p ? { ...p, name: data.name } : p));
      await update({ name: data.name });
      setEditing(false);
    }
    setSaving(false);
  }

  const displayName =
    profile?.name ?? session?.user?.name ?? "Player";
  const displayEmail = profile?.email ?? session?.user?.email ?? "";
  const isAuthenticated = status === "authenticated";

  return (
    <div>
      <h1 className="page-title mb-8">Profile</h1>

      <div className="panel mx-auto max-w-2xl p-6 sm:p-8">
        <div className="flex flex-col items-center sm:flex-row sm:items-start sm:gap-6">
          <div className="flex h-28 w-28 shrink-0 items-center justify-center rounded-full bg-[var(--pink)]">
            <span className="text-5xl" aria-hidden>
              🫐
            </span>
          </div>

          <div className="mt-4 flex-1 text-center sm:mt-0 sm:text-left">
            <p className="text-xs font-semibold uppercase text-[var(--muted)]">
              User
            </p>
            <div className="mt-1 flex flex-wrap items-center justify-center gap-3 sm:justify-start">
              {editing ? (
                <form onSubmit={handleSave} className="flex gap-2">
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="rounded border border-[#555] bg-[#1a1a1a] px-2 py-1 text-white"
                  />
                  <button
                    type="submit"
                    disabled={saving}
                    className="btn-teal px-3 py-1 text-xs"
                  >
                    Save
                  </button>
                </form>
              ) : (
                <>
                  <h2 className="text-xl font-bold text-white">{displayName}</h2>
                  <button
                    type="button"
                    onClick={() => setEditing(true)}
                    className="rounded border border-[var(--teal)] px-3 py-0.5 text-xs font-semibold text-[var(--teal)]"
                  >
                    Edit
                  </button>
                </>
              )}
            </div>
            {displayEmail && (
              <p className="mt-2 text-sm text-[var(--muted)]">{displayEmail}</p>
            )}
          </div>
        </div>

        {isAuthenticated && !editing && (
          <div className="mt-6 flex flex-wrap justify-center gap-3 sm:justify-start">
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: "/" })}
              className="rounded border border-[#555] px-4 py-2 text-sm font-semibold text-white transition-colors hover:border-red-400 hover:text-red-400"
            >
              Log out
            </button>
          </div>
        )}

        {loadingProfile && isAuthenticated && (
          <p className="mt-8 text-sm text-[var(--muted)]">Loading profile...</p>
        )}

        {profileError && isAuthenticated && (
          <p className="mt-8 rounded border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300" role="alert">
            {profileError}. Try signing out and back in.
          </p>
        )}

        {profile && (
          <>
            <div className="mt-8 grid grid-cols-2 gap-6 sm:grid-cols-3">
              <div>
                <p className="text-sm font-semibold text-white">System Rank</p>
                <p className="text-2xl font-bold text-white">
                  {profile.systemRank.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Achievements</p>
                <div className="mt-2 flex -space-x-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span
                      key={i}
                      className={`h-8 w-8 rounded-full border-2 border-[var(--panel)] ${
                        i < profile.achievementCount
                          ? "bg-[var(--pink)]"
                          : "bg-[#555]"
                      }`}
                    />
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold text-white">XP Level</p>
                <p className="text-2xl font-bold text-white">{profile.xpLevel}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Skill Rank</p>
                <p className="text-lg font-bold text-white">{profile.skillRank}</p>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <p className="text-sm font-semibold text-white">Coins</p>
                <p className="flex items-center gap-2 text-2xl font-bold text-white">
                  {profile.coins.toLocaleString()}
                  <span className="rounded bg-amber-500/20 px-2 py-0.5 text-xs text-amber-300">
                    H57
                  </span>
                </p>
              </div>
            </div>

            <div className="mt-6 h-3 overflow-hidden rounded-full bg-[#1a1a1a]">
              <div
                className="h-full rounded-full bg-[var(--teal)]"
                style={{ width: `${profile.xpLevel % 100}%` }}
              />
            </div>

            <div className="mt-8 border-t border-[#555] pt-6 text-sm text-[var(--muted)]">
              <p>{profile.orderCount} orders · {profile.libraryCount} library games</p>
              <Link href="/library" className="mt-2 inline-block text-[var(--teal)] hover:underline">
                View library →
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
