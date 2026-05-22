"use client";

import { useState } from "react";
import Link from "next/link";
import type { Game } from "@/types/game";
import { GameCover } from "./GameCover";

export function FeaturedCarousel({ games }: { games: Game[] }) {
  const [index, setIndex] = useState(0);
  if (games.length === 0) return null;

  const game = games[index % games.length];

  return (
    <div className="relative overflow-hidden rounded-lg border border-[#3a3a3a] bg-[#1a1a1a]">
      <Link href={`/games/${game.id}`} className="block">
        <GameCover game={game} className="aspect-[21/9] min-h-[200px]" />
      </Link>
      {games.length > 1 && (
        <>
          <button
            type="button"
            onClick={() => setIndex((i) => (i - 1 + games.length) % games.length)}
            className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-[var(--pink)]/90 px-2 py-1 text-white hover:bg-[var(--pink)]"
            aria-label="Previous"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={() => setIndex((i) => (i + 1) % games.length)}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-[var(--pink)]/90 px-2 py-1 text-white hover:bg-[var(--pink)]"
            aria-label="Next"
          >
            ›
          </button>
        </>
      )}
    </div>
  );
}
