"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import type { Game } from "@/types/game";
import { formatPrice } from "@/lib/pricing";
import { useStore } from "@/context/StoreContext";

type GameActionsProps = {
  game: Game;
  layout?: "default" | "detail";
};

export function GameActions({ game, layout = "default" }: GameActionsProps) {
  const router = useRouter();
  const { status } = useSession();
  const { addToCart, isInCart, cart } = useStore();
  const inCart = isInCart(game.id);

  async function handleBuyNow() {
    if (!inCart) await addToCart(game);
    if (status === "authenticated") router.push("/checkout");
    else router.push(`/login?callbackUrl=${encodeURIComponent("/checkout")}`);
  }

  if (layout === "detail") {
    return (
      <div className="flex w-full shrink-0 flex-col items-stretch gap-3 sm:w-auto sm:min-w-[160px]">
        <button
          type="button"
          onClick={() => addToCart(game)}
          className="game-detail-btn"
        >
          {inCart ? "Add Another" : "Add to Cart"}
        </button>
        <button type="button" onClick={handleBuyNow} className="game-detail-btn">
          Buy Game
        </button>
        {inCart && (
          <Link
            href="/cart"
            className="text-center text-xs text-[var(--teal)] hover:underline"
          >
            In cart ({cart.find((i) => i.game.id === game.id)?.quantity ?? 1}) →
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <span className="text-2xl font-bold text-[var(--teal)] sm:text-3xl">
        {formatPrice(game.price)}
      </span>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => addToCart(game)}
          className="rounded border-2 border-[var(--pink)] px-6 py-2.5 text-sm font-bold text-[var(--pink)] hover:bg-[var(--pink)]/10"
        >
          {inCart ? "Add Another" : "Add to Cart"}
        </button>
        <button type="button" onClick={handleBuyNow} className="btn-teal px-6 py-2.5 text-sm">
          Buy Now
        </button>
      </div>
      {inCart && (
        <Link href="/cart" className="text-sm text-[var(--teal)] hover:underline">
          View in cart ({cart.find((i) => i.game.id === game.id)?.quantity ?? 1}) →
        </Link>
      )}
    </div>
  );
}
