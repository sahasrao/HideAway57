"use client";

import Image from "next/image";
import { useState } from "react";
import Link from "next/link";
import type { Game } from "@/types/game";
import { getFeaturedCardImage } from "@/lib/game-assets";

function carouselImage(game: Game) {
  if (game.id === "froot-shooter") {
    return "/games/froot-shooter-hero.png";
  }
  return getFeaturedCardImage(game.id);
}

export function FeaturedCarousel({ games }: { games: Game[] }) {
  const [index, setIndex] = useState(0);
  if (games.length === 0) return null;

  const game = games[index % games.length];

  return (
    <div className="relative overflow-hidden rounded-[10px] border border-[#3a3a3a] bg-[#141414] shadow-[0_4px_12px_rgba(0,0,0,0.35)]">
      <Link href={`/games/${game.id}`} className="block">
        <div className="relative aspect-[21/9] min-h-[160px] w-full sm:min-h-[220px] lg:min-h-[280px]">
          <Image
            src={carouselImage(game)}
            alt={game.title}
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
        </div>
      </Link>
      {games.length > 1 && (
        <>
          <button
            type="button"
            onClick={() => setIndex((i) => (i - 1 + games.length) % games.length)}
            className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-[var(--pink)]/90 text-lg text-white shadow-md transition-colors hover:bg-[var(--pink)] sm:left-4"
            aria-label="Previous featured game"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={() => setIndex((i) => (i + 1) % games.length)}
            className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-[var(--pink)]/90 text-lg text-white shadow-md transition-colors hover:bg-[var(--pink)] sm:right-4"
            aria-label="Next featured game"
          >
            ›
          </button>
        </>
      )}
    </div>
  );
}
