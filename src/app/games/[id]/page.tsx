"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import type { Game } from "@/types/game";
import { GameActions } from "@/components/GameActions";
import { getFeaturedCardImage } from "@/lib/game-assets";
import { formatPrice } from "@/lib/pricing";

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

  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/" className="text-sm text-[var(--teal)] hover:underline">
        ← Back to games
      </Link>

      <article className="mt-4 overflow-hidden rounded-[10px] border border-[#3a3a3a] shadow-[0_4px_12px_rgba(0,0,0,0.35)]">
        <div className="relative aspect-[415/294] w-full bg-[#141414]">
          <Image
            src={getFeaturedCardImage(game.id)}
            alt={game.title}
            fill
            className="object-cover object-center"
            priority
            sizes="(max-width: 768px) 100vw, 768px"
          />
        </div>

        <div className="flex flex-col gap-6 bg-[var(--panel)] p-6 sm:flex-row sm:items-start sm:justify-between sm:gap-8 sm:p-8">
          <div className="min-w-0 flex-1">
            <h1 className="text-lg font-black uppercase leading-tight text-white sm:text-xl">
              {game.title}
            </h1>
            <p className="mt-2 text-2xl font-bold text-white">
              {formatPrice(game.price)}
            </p>
            <p className="mt-4 text-sm leading-relaxed text-white/90 sm:text-base">
              {game.concept}
            </p>
          </div>

          <GameActions game={game} layout="detail" />
        </div>
      </article>
    </div>
  );
}
