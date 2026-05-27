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
      <div className="flex flex-col gap-6 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between">
        <h1 className="page-title">Cart</h1>

        <div className="panel w-full p-5 text-center sm:min-w-[220px] sm:w-auto">
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
              <li key={item.game.id} className="flex flex-col gap-4 sm:flex-row">
                <Link
                  href={`/games/${item.game.id}`}
                  className="relative mx-auto h-36 w-full max-w-[280px] shrink-0 overflow-hidden rounded border border-[#3a3a3a] sm:mx-0 sm:h-28 sm:w-44"
                >
                  <GameCover game={item.game} className="h-full w-full" showTitle />
                </Link>
                <div className="flex flex-1 flex-col justify-center text-center sm:text-left">
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
                    className="mt-2 w-full text-sm text-[var(--muted)] underline hover:text-white sm:w-fit"
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
