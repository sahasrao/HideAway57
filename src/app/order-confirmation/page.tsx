"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import type { Order } from "@/types/game";
import { formatPrice } from "@/lib/pricing";
import { useStore } from "@/context/StoreContext";

function OrderConfirmationContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const orderId = searchParams.get("order_id");
  const { downloadGame, isInLibrary, refreshCart } = useStore();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!sessionId && !orderId) {
        setLoading(false);
        return;
      }
      const url = sessionId
        ? `/api/orders/lookup?session_id=${sessionId}`
        : `/api/orders/${orderId}`;
      const res = await fetch(url);
      if (res.ok) {
        setOrder(await res.json());
        await refreshCart();
      }
      setLoading(false);
    }
    load();
  }, [sessionId, orderId, refreshCart]);

  if (loading) {
    return <p className="text-[var(--muted)]">Loading order...</p>;
  }

  if (!order) {
    return (
      <div>
        <h1 className="page-title">Order confirmed</h1>
        <p className="mt-4 text-[var(--muted)]">Order not found.</p>
      </div>
    );
  }

  const orderDate = new Date(order.createdAt).toLocaleDateString("en-US");
  const shortId = order.id.slice(-6).toUpperCase();

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="page-title mb-8">Order confirmed</h1>

      <div className="panel space-y-4 p-8 text-sm text-white">
        <p>
          <span className="font-semibold">Order Number:</span> #{shortId}
        </p>
        <p>
          <span className="font-semibold">Order Date:</span> {orderDate}
        </p>
        <p>
          <span className="font-semibold">Total Spending:</span>{" "}
          {formatPrice(order.total)}
        </p>

        <div className="border-t border-[#555] pt-4">
          <p className="mb-3 font-semibold">Items:</p>
          <ul className="space-y-2">
            {order.items.map((item) => (
              <li key={item.game.id} className="flex justify-between">
                <span>{item.game.title}</span>
                <span>{formatPrice(item.price)}</span>
              </li>
            ))}
          </ul>
        </div>

        {order.items.map((item) => (
          <button
            key={item.game.id}
            type="button"
            onClick={() => downloadGame(item.game.id)}
            className="btn-teal mt-4 w-full py-3 text-base"
          >
            {isInLibrary(item.game.id) ? "Downloaded ✓" : "Download Content"}
          </button>
        ))}

        <Link
          href="/library"
          className="block text-center text-[var(--teal)] hover:underline"
        >
          Go to library
        </Link>
      </div>
    </div>
  );
}

export default function OrderConfirmationPage() {
  return (
    <Suspense fallback={<p className="text-[var(--muted)]">Loading...</p>}>
      <OrderConfirmationContent />
    </Suspense>
  );
}
