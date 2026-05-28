"use client";

import Image from "next/image";
import { useState } from "react";
import Link from "next/link";
import type { Game } from "@/types/game";
import { getCarouselImage } from "@/lib/game-assets";

export function FeaturedCarousel({ games }: { games: Game[] }) {
  const [index, setIndex] = useState(0);
  if (games.length === 0) return null;

  const game = games[index % games.length];

  return (
    <div className="relative overflow-hidden rounded-[10px] border border-[#3a3a3a] bg-[#141414] shadow-[0_4px_12px_rgba(0,0,0,0.35)]">
      <Link href={`/games/${game.id}`} className="block">
        <div className="relative aspect-video w-full overflow-hidden">
          <Image
            src={getCarouselImage(game.id)}
            alt={game.title}
            fill
            className="h-full w-full"
            priority
            quality={95}
            unoptimized
            sizes="(max-width: 1024px) 100vw, min(3840px, calc(100vw - 302px))"
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
