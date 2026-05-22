"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import type { Game } from "@/types/game";
import { GameCard } from "@/components/GameCard";
import { FeaturedCarousel } from "@/components/FeaturedCarousel";

function HomeContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") ?? "";
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const url = query
        ? `/api/games?q=${encodeURIComponent(query)}`
        : "/api/games";
      const res = await fetch(url);
      if (res.ok) setGames(await res.json());
      setLoading(false);
    }
    load();
  }, [query]);

  const featured = games.find((g) => g.id === "froot-shooter") ?? games[0];

  return (
    <div>
      {!query && (
        <p className="banner-text mb-4 text-center text-sm sm:text-base">
          Enter the gateway to hidden worlds of fun games
        </p>
      )}

      {!query && featured && (
        <FeaturedCarousel games={games.length ? [featured, ...games.filter((g) => g.id !== featured.id)] : []} />
      )}

      <h2 className="page-title mt-8 mb-6">
        {query ? "Search results" : "Featured games"}
      </h2>

      {loading ? (
        <p className="text-[var(--muted)]">Loading games...</p>
      ) : games.length === 0 ? (
        <p className="text-[var(--muted)]">No games found.</p>
      ) : (
        <div className="grid gap-6 grid-cols-2 md:grid-cols-3">
          {games.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<p className="text-[var(--muted)]">Loading...</p>}>
      <HomeContent />
    </Suspense>
  );
}
