"use client";

import Link from "next/link";
import type { Game } from "@/types/game";
import { GameCover } from "./GameCover";
import { useStore } from "@/context/StoreContext";

export function GameCard({ game }: { game: Game }) {
  const { addToCart } = useStore();

  return (
    <article className="group text-center">
      <Link href={`/games/${game.id}`} className="block overflow-hidden rounded-md border border-[#3a3a3a]">
        <GameCover
          game={game}
          className="aspect-square transition-transform group-hover:scale-[1.03]"
        />
      </Link>
      <h3 className="mt-2 text-xs font-bold uppercase tracking-wide text-white sm:text-sm">
        <Link href={`/games/${game.id}`} className="hover:text-[var(--pink)]">
          {game.title}
        </Link>
      </h3>
      <button
        type="button"
        onClick={() => addToCart(game)}
        className="mt-1 text-[10px] font-semibold text-[var(--teal)] hover:underline"
      >
        Add to cart · ${game.price.toFixed(0)}
      </button>
    </article>
  );
}
