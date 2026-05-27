"use client";

import Image from "next/image";
import Link from "next/link";
import type { Game } from "@/types/game";
import { getFeaturedCardImage } from "@/lib/game-assets";

export function FeaturedGameCard({ game }: { game: Game }) {
  return (
    <article className="group">
      <Link
        href={`/games/${game.id}`}
        className="block overflow-hidden rounded-[10px] shadow-[0_4px_2px_rgba(0,0,0,0.25)] transition-transform duration-200 hover:scale-[1.02] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--teal)]"
      >
        <div className="relative aspect-[415/294] w-full bg-[#141414]">
          <Image
            src={getFeaturedCardImage(game.id)}
            alt={game.title}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 415px"
          />
        </div>
      </Link>
    </article>
  );
}
