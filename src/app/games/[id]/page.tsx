"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import type { Game } from "@/types/game";
import { GameCover } from "@/components/GameCover";
import { GameActions } from "@/components/GameActions";

export default function GameDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [game, setGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/games/${id}`);
      if (res.ok) setGame(await res.json());
      setLoading(false);
    }
    load();
  }, [id]);

  if (loading) return <p className="text-[var(--muted)]">Loading game...</p>;

  if (!game) {
    return (
      <div>
        <h1 className="page-title">Not found</h1>
        <Link href="/" className="mt-4 text-[var(--teal)] hover:underline">
          ← Back to games
        </Link>
      </div>
    );
  }

  const published = new Date(game.publishedDate).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="max-w-4xl">
      <Link href="/" className="text-sm text-[var(--teal)] hover:underline">
        ← Back to games
      </Link>

      <div className="mt-6 grid gap-8 lg:grid-cols-2">
        <GameCover game={game} className="aspect-square rounded-lg border border-[#3a3a3a]" showTitle />

        <div>
          <p className="text-sm font-bold uppercase text-[var(--pink)]">{game.genre}</p>
          <h1 className="mt-2 text-2xl font-black uppercase text-white">{game.title}</h1>
          <div className="mt-6">
            <GameActions game={game} />
          </div>
          <p className="mt-6 leading-relaxed text-[var(--muted)]">{game.concept}</p>
          <dl className="mt-6 grid gap-3 text-sm sm:grid-cols-2">
            <div className="panel p-3">
              <dt className="text-[var(--muted)]">Publisher</dt>
              <dd className="font-semibold text-white">{game.publisher}</dd>
            </div>
            <div className="panel p-3">
              <dt className="text-[var(--muted)]">Released</dt>
              <dd className="font-semibold text-white">{published}</dd>
            </div>
            <div className="panel p-3 sm:col-span-2">
              <dt className="text-[var(--muted)]">Platforms</dt>
              <dd className="font-semibold text-white">{game.platforms.join(", ")}</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}
