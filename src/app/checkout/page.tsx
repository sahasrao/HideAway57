"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useState, Suspense } from "react";
import { useStore } from "@/context/StoreContext";
import {
  formatPrice,
  getCartSubtotal,
  PROCESSING_FEE,
  TAX_RATE,
} from "@/lib/pricing";

function CheckoutContent() {
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const canceled = searchParams.get("canceled");
  const { cart } = useStore();
  const [email, setEmail] = useState(session?.user?.email ?? "");
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const subtotal = getCartSubtotal(cart);
  const tax = subtotal * TAX_RATE;
  const total = subtotal + tax + PROCESSING_FEE;

  async function handlePay(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/checkout/session", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Checkout failed");
        return;
      }
      if (data.url) window.location.href = data.url;
      else setError("No checkout URL returned");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (cart.length === 0) {
    return (
      <div>
        <h1 className="page-title">Checkout</h1>
        <p className="mt-6 text-[var(--muted)]">
          <Link href="/cart" className="text-[var(--teal)] hover:underline">
            Your cart is empty
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="page-title mb-8">Checkout</h1>

      {canceled && (
        <p className="mb-4 text-sm text-amber-300">Payment was canceled.</p>
      )}

      <form onSubmit={handlePay} className="panel space-y-6 p-8">
        <ul className="space-y-2 text-sm text-white">
          {cart.map((item) => (
            <li key={item.game.id} className="flex justify-between">
              <span>{item.game.title}</span>
              <span>{formatPrice(item.game.price * item.quantity)}</span>
            </li>
          ))}
          <li className="flex justify-between border-t border-[#555] pt-2">
            <span>Tax:</span>
            <span>{formatPrice(tax)}</span>
          </li>
          <li className="flex justify-between border-t-2 border-[var(--pink)] pt-2 text-base font-bold">
            <span>Total:</span>
            <span>{formatPrice(total)}</span>
          </li>
        </ul>

        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-semibold text-white">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email@email.com"
            required
            className="w-full rounded border border-[#555] bg-white px-3 py-2 text-black focus:outline-none focus:ring-2 focus:ring-[var(--teal)]"
          />
        </div>

        <div>
          <label htmlFor="payment" className="mb-1 block text-sm font-semibold text-white">
            Payment Method
          </label>
          <select
            id="payment"
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            className="w-full rounded border border-[#555] bg-white px-3 py-2 text-black focus:outline-none"
          >
            <option value="card">Credit / Debit Card</option>
            <option value="stripe">Stripe Checkout</option>
          </select>
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="btn-teal w-full py-3 text-base disabled:opacity-50"
        >
          {loading ? "Processing..." : "Continue With Payment"}
        </button>
      </form>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<p className="text-[var(--muted)]">Loading...</p>}>
      <CheckoutContent />
    </Suspense>
  );
}
