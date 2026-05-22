"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useStore } from "@/context/StoreContext";
import {
  formatPrice,
  getCartItemCount,
  getCartSubtotal,
} from "@/lib/pricing";
import { GameCover } from "@/components/GameCover";

export default function CartPage() {
  const { status } = useSession();
  const { cart, removeFromCart, loading } = useStore();
  const itemCount = getCartItemCount(cart);
  const subtotal = getCartSubtotal(cart);

  const checkoutHref =
    status === "authenticated"
      ? "/checkout"
      : `/login?callbackUrl=${encodeURIComponent("/checkout")}`;

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-6">
        <h1 className="page-title">Cart</h1>

        <div className="panel min-w-[220px] p-5 text-center">
          <p className="text-sm text-white">
            Total Items: <span className="font-bold">{itemCount}</span>
          </p>
          <p className="mt-1 text-sm text-white">
            Total Price: <span className="font-bold">{formatPrice(subtotal)}</span>
          </p>
          {cart.length > 0 ? (
            <Link href={checkoutHref} className="btn-teal mt-4 inline-block w-full px-4 py-2.5 text-sm">
              Proceed to checkout
            </Link>
          ) : (
            <span className="mt-4 inline-block w-full rounded bg-[#555] px-4 py-2.5 text-sm text-[#999]">
              Proceed to checkout
            </span>
          )}
        </div>
      </div>

      <div className="mt-8">
        {loading ? (
          <p className="text-[var(--muted)]">Loading cart...</p>
        ) : cart.length === 0 ? (
          <p className="text-[var(--muted)]">
            Your cart is empty.{" "}
            <Link href="/" className="text-[var(--teal)] hover:underline">
              Browse games
            </Link>
          </p>
        ) : (
          <ul className="space-y-6">
            {cart.map((item) => (
              <li key={item.game.id} className="flex gap-4">
                <Link href={`/games/${item.game.id}`} className="relative h-28 w-44 shrink-0 overflow-hidden rounded border border-[#3a3a3a]">
                  <GameCover game={item.game} className="h-full w-full" showTitle />
                </Link>
                <div className="flex flex-1 flex-col justify-center">
                  <Link
                    href={`/games/${item.game.id}`}
                    className="text-lg font-bold uppercase text-white hover:text-[var(--pink)]"
                  >
                    {item.game.title}
                  </Link>
                  <p className="mt-1 font-semibold text-white">
                    {formatPrice(item.game.price * item.quantity)}
                  </p>
                  <button
                    type="button"
                    onClick={() => removeFromCart(item.game.id)}
                    className="mt-2 w-fit text-sm text-[var(--muted)] underline hover:text-white"
                  >
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
