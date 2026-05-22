"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useSession } from "next-auth/react";
import type { CartItem, Game } from "@/types/game";
import { getCartItemCount, getCartSubtotal } from "@/lib/pricing";

interface StoreContextValue {
  cart: CartItem[];
  library: Game[];
  libraryLoaded: boolean;
  cartCount: number;
  cartSubtotal: number;
  loading: boolean;
  addToCart: (game: Game) => Promise<void>;
  removeFromCart: (gameId: string) => Promise<void>;
  isInCart: (gameId: string) => boolean;
  isInLibrary: (gameId: string) => boolean;
  refreshCart: () => Promise<void>;
  refreshLibrary: () => Promise<void>;
  downloadGame: (gameId: string) => Promise<boolean>;
}

const StoreContext = createContext<StoreContextValue | null>(null);
const GUEST_CART_KEY = "hideaway57-guest-cart";

function loadGuestCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(GUEST_CART_KEY);
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch {
    return [];
  }
}

function saveGuestCart(cart: CartItem[]) {
  localStorage.setItem(GUEST_CART_KEY, JSON.stringify(cart));
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [library, setLibrary] = useState<Game[]>([]);
  const [libraryLoaded, setLibraryLoaded] = useState(false);
  const [loading, setLoading] = useState(true);

  const refreshCart = useCallback(async () => {
    if (status !== "authenticated") {
      setCart(loadGuestCart());
      return;
    }
    const res = await fetch("/api/cart");
    if (res.ok) {
      setCart(await res.json());
    }
  }, [status]);

  const refreshLibrary = useCallback(async () => {
    if (status !== "authenticated") {
      setLibrary([]);
      setLibraryLoaded(true);
      return;
    }
    const res = await fetch("/api/library");
    if (res.ok) {
      const data = (await res.json()) as { game: Game }[];
      setLibrary(data.map((e) => e.game));
    }
    setLibraryLoaded(true);
  }, [status]);

  useEffect(() => {
    if (status === "loading") return;

    async function init() {
      setLoading(true);
      if (status === "authenticated") {
        const guestCart = loadGuestCart();
        if (guestCart.length > 0) {
          await fetch("/api/cart/merge", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(
              guestCart.map((i) => ({
                gameId: i.game.id,
                quantity: i.quantity,
              }))
            ),
          });
          localStorage.removeItem(GUEST_CART_KEY);
        }
        await refreshCart();
        await refreshLibrary();
      } else {
        setCart(loadGuestCart());
        setLibrary([]);
        setLibraryLoaded(true);
      }
      setLoading(false);
    }

    init();
  }, [status, refreshCart, refreshLibrary]);

  const addToCart = useCallback(
    async (game: Game) => {
      if (status === "authenticated") {
        const res = await fetch("/api/cart", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ gameId: game.id }),
        });
        if (res.ok) setCart(await res.json());
        return;
      }
      setCart((prev) => {
        const existing = prev.find((i) => i.game.id === game.id);
        const next = existing
          ? prev.map((i) =>
              i.game.id === game.id
                ? { ...i, quantity: i.quantity + 1 }
                : i
            )
          : [...prev, { game, quantity: 1 }];
        saveGuestCart(next);
        return next;
      });
    },
    [status]
  );

  const removeFromCart = useCallback(
    async (gameId: string) => {
      if (status === "authenticated") {
        const res = await fetch(`/api/cart?gameId=${gameId}`, {
          method: "DELETE",
        });
        if (res.ok) setCart(await res.json());
        return;
      }
      setCart((prev) => {
        const next = prev.filter((i) => i.game.id !== gameId);
        saveGuestCart(next);
        return next;
      });
    },
    [status]
  );

  const isInCart = useCallback(
    (gameId: string) => cart.some((i) => i.game.id === gameId),
    [cart]
  );

  const isInLibrary = useCallback(
    (gameId: string) => library.some((g) => g.id === gameId),
    [library]
  );

  const downloadGame = useCallback(
    async (gameId: string) => {
      const res = await fetch("/api/library/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gameId }),
      });
      if (!res.ok) return false;

      const data = (await res.json()) as {
        filename: string;
        downloadUrl: string;
        game: Game;
      };

      const fileRes = await fetch(data.downloadUrl, { credentials: "include" });
      if (!fileRes.ok) return false;

      const blob = await fileRes.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = data.filename;
      anchor.click();
      URL.revokeObjectURL(url);

      await refreshLibrary();
      return true;
    },
    [refreshLibrary]
  );

  const value = useMemo<StoreContextValue>(
    () => ({
      cart,
      library,
      libraryLoaded,
      cartCount: getCartItemCount(cart),
      cartSubtotal: getCartSubtotal(cart),
      loading,
      addToCart,
      removeFromCart,
      isInCart,
      isInLibrary,
      refreshCart,
      refreshLibrary,
      downloadGame,
    }),
    [
      cart,
      library,
      libraryLoaded,
      loading,
      addToCart,
      removeFromCart,
      isInCart,
      isInLibrary,
      refreshCart,
      refreshLibrary,
      downloadGame,
    ]
  );

  return (
    <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
