"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { FormEvent, useEffect, useState } from "react";
import { BluRazAvatar } from "@/components/BluRazAvatar";
import { FruitAchievementIcon } from "@/components/FruitAchievementIcon";
import { ACHIEVEMENTS } from "@/lib/achievements";
import { AVATAR_PRESETS } from "@/lib/avatar-theme";

interface Profile {
  id: string;
  name: string | null;
  email: string;
  avatarBodyColor: string;
  avatarAccentColor: string;
  orderCount: number;
  libraryCount: number;
  systemRank: number;
  xpLevel: number;
  skillRank: string;
  coins: number;
  achievementCount: number;
}

type SaveNotice = { type: "success" | "error"; message: string };

export default function ProfilePage() {
  const { data: session, status, update } = useSession();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileError, setProfileError] = useState("");
  const [saveNotice, setSaveNotice] = useState<SaveNotice | null>(null);
  const [editing, setEditing] = useState(false);
  const [customizingAvatar, setCustomizingAvatar] = useState(false);
  const [name, setName] = useState("");
  const [bodyColor, setBodyColor] = useState("#67c8ca");
  const [accentColor, setAccentColor] = useState("#404ba0");
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
        setBodyColor(data.avatarBodyColor);
        setAccentColor(data.avatarAccentColor);
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

  async function patchProfile(
    payload: Record<string, string>
  ): Promise<Profile | null> {
    setSaveNotice(null);
    setSaving(true);

    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? "Failed to save");
      }

      return data as Profile;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to save profile";
      setSaveNotice({ type: "error", message });
      return null;
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveName(e: FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setSaveNotice({ type: "error", message: "Name can't be empty" });
      return;
    }

    if (trimmed === (profile?.name ?? "")) {
      setEditing(false);
      return;
    }

    const data = await patchProfile({ name: trimmed });
    if (!data) return;

    setProfile((p) => (p ? { ...p, name: data.name } : p));
    setName(data.name ?? trimmed);
    await update({ name: data.name ?? trimmed });
    setEditing(false);
    setSaveNotice({ type: "success", message: "Name saved" });
  }

  async function handleSaveAvatar(e: FormEvent) {
    e.preventDefault();

    if (
      bodyColor === profile?.avatarBodyColor &&
      accentColor === profile?.avatarAccentColor
    ) {
      setCustomizingAvatar(false);
      return;
    }

    const data = await patchProfile({
      avatarBodyColor: bodyColor,
      avatarAccentColor: accentColor,
    });
    if (!data) return;

    setProfile((p) =>
      p
        ? {
            ...p,
            avatarBodyColor: data.avatarBodyColor,
            avatarAccentColor: data.avatarAccentColor,
          }
        : p
    );
    setBodyColor(data.avatarBodyColor);
    setAccentColor(data.avatarAccentColor);
    setCustomizingAvatar(false);
    setSaveNotice({ type: "success", message: "Avatar saved" });
  }

  function cancelNameEdit() {
    setName(profile?.name ?? "Player");
    setEditing(false);
    setSaveNotice(null);
  }

  function cancelAvatarEdit() {
    setBodyColor(profile?.avatarBodyColor ?? "#67c8ca");
    setAccentColor(profile?.avatarAccentColor ?? "#404ba0");
    setCustomizingAvatar(false);
    setSaveNotice(null);
  }

  function applyPreset(body: string, accent: string) {
    setBodyColor(body);
    setAccentColor(accent);
  }

  const displayName =
    profile?.name ?? session?.user?.name ?? "Player";
  const displayEmail = profile?.email ?? session?.user?.email ?? "";
  const isAuthenticated = status === "authenticated";
  const avatarBody = profile?.avatarBodyColor ?? bodyColor;
  const avatarAccent = profile?.avatarAccentColor ?? accentColor;
  const nameUnchanged = name.trim() === (profile?.name ?? "");
  const avatarUnchanged =
    bodyColor === profile?.avatarBodyColor &&
    accentColor === profile?.avatarAccentColor;

  return (
    <div>
      <h1 className="page-title mb-8">Profile</h1>

      <div className="panel mx-auto max-w-2xl p-6 sm:p-8">
        {saveNotice && (
          <p
            className={`mb-4 rounded border px-4 py-3 text-sm ${
              saveNotice.type === "success"
                ? "border-[var(--teal)]/40 bg-[var(--teal)]/10 text-[var(--teal)]"
                : "border-red-500/40 bg-red-500/10 text-red-300"
            }`}
            role="status"
          >
            {saveNotice.message}
          </p>
        )}

        <div className="flex flex-col items-center sm:flex-row sm:items-start sm:gap-6">
          <div className="relative shrink-0">
            <div
              className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-full bg-[#141414]"
              style={{
                boxShadow: `0 0 0 2px ${customizingAvatar ? accentColor : avatarAccent}`,
              }}
            >
              <BluRazAvatar
                bodyColor={customizingAvatar ? bodyColor : avatarBody}
                size={96}
              />
            </div>
            {isAuthenticated && !customizingAvatar && (
              <button
                type="button"
                onClick={() => {
                  setBodyColor(avatarBody);
                  setAccentColor(avatarAccent);
                  setCustomizingAvatar(true);
                  setSaveNotice(null);
                }}
                className="mt-3 w-full rounded border border-[var(--teal)] px-3 py-1 text-xs font-semibold text-[var(--teal)] transition-colors hover:bg-[var(--teal)]/10"
              >
                Customize avatar
              </button>
            )}
          </div>

          <div className="mt-4 flex-1 text-center sm:mt-0 sm:text-left">
            <p className="text-xs font-semibold uppercase text-[var(--muted)]">
              User
            </p>
            <div className="mt-1 flex flex-wrap items-center justify-center gap-3 sm:justify-start">
              {editing ? (
                <form onSubmit={handleSaveName} className="flex flex-wrap gap-2">
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    maxLength={80}
                    autoFocus
                    disabled={saving}
                    className="min-w-[160px] rounded border border-[#555] bg-[#1a1a1a] px-2 py-1 text-white disabled:opacity-60"
                  />
                  <button
                    type="submit"
                    disabled={saving || !name.trim() || nameUnchanged}
                    className="btn-teal px-3 py-1 text-xs disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {saving ? "Saving…" : "Save"}
                  </button>
                  <button
                    type="button"
                    onClick={cancelNameEdit}
                    disabled={saving}
                    className="rounded border border-[#555] px-3 py-1 text-xs text-white disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </form>
              ) : (
                <>
                  <h2 className="text-xl font-bold text-white">{displayName}</h2>
                  <button
                    type="button"
                    onClick={() => {
                      setName(profile?.name ?? "Player");
                      setEditing(true);
                      setSaveNotice(null);
                    }}
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

        {customizingAvatar && (
          <form
            onSubmit={handleSaveAvatar}
            className="mt-6 rounded-lg border border-[#444] bg-[#1a1a1a] p-4"
          >
            <p className="text-sm font-semibold text-white">Avatar colors</p>
            <p className="mt-1 text-xs text-[var(--muted)]">
              Pick a preset or shift the PNG tint. Accent color sets the ring.
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              {AVATAR_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => applyPreset(preset.bodyColor, preset.accentColor)}
                  disabled={saving}
                  className="flex items-center gap-2 rounded-full border border-[#555] px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:border-[var(--teal)] disabled:opacity-50"
                >
                  <span
                    className="inline-block h-4 w-4 rounded-full ring-1 ring-[#666]"
                    style={{
                      background: `linear-gradient(135deg, ${preset.bodyColor} 50%, ${preset.accentColor} 50%)`,
                    }}
                  />
                  {preset.label}
                </button>
              ))}
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4">
              <label className="text-xs font-semibold text-[var(--muted)]">
                Body
                <input
                  type="color"
                  value={bodyColor}
                  onChange={(e) => setBodyColor(e.target.value)}
                  disabled={saving}
                  className="mt-1 h-10 w-full cursor-pointer rounded border border-[#555] bg-transparent disabled:opacity-50"
                />
              </label>
              <label className="text-xs font-semibold text-[var(--muted)]">
                Accent
                <input
                  type="color"
                  value={accentColor}
                  onChange={(e) => setAccentColor(e.target.value)}
                  disabled={saving}
                  className="mt-1 h-10 w-full cursor-pointer rounded border border-[#555] bg-transparent disabled:opacity-50"
                />
              </label>
            </div>

            <div className="mt-4 flex gap-2">
              <button
                type="submit"
                disabled={saving || avatarUnchanged}
                className="btn-teal px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? "Saving…" : "Save avatar"}
              </button>
              <button
                type="button"
                onClick={cancelAvatarEdit}
                disabled={saving}
                className="rounded border border-[#555] px-4 py-2 text-sm text-white disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

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
          <p
            className="mt-8 rounded border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300"
            role="alert"
          >
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
                <div className="mt-2 flex -space-x-1">
                  {ACHIEVEMENTS.map((achievement, i) => {
                    const unlocked = i < profile.achievementCount;
                    return (
                      <span
                        key={achievement.id}
                        title={`${achievement.label}${unlocked ? "" : " (locked)"}`}
                        className={`inline-flex h-9 w-9 items-center justify-center rounded-full border-2 border-[var(--panel)] bg-[#1a1a1a] ${
                          unlocked ? "ring-1 ring-[var(--pink)]/40" : ""
                        }`}
                      >
                        <FruitAchievementIcon
                          fruit={achievement.fruit}
                          size={26}
                          unlocked={unlocked}
                        />
                      </span>
                    );
                  })}
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
              <p>
                {profile.orderCount} orders · {profile.libraryCount} library games
              </p>
              <Link
                href="/library"
                className="mt-2 inline-block text-[var(--teal)] hover:underline"
              >
                View library →
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
