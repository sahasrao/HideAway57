"use client";

import { useEffect, useMemo, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import type { Game } from "@/types/game";
import { GameCard } from "@/components/GameCard";
import { FeaturedCarousel } from "@/components/FeaturedCarousel";
import { FeaturedGameCard } from "@/components/FeaturedGameCard";
import { FEATURED_GAME_IDS } from "@/lib/game-assets";

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

  const featuredGames = useMemo(() => {
    const byId = new Map(games.map((g) => [g.id, g]));
    return FEATURED_GAME_IDS.map((id) => byId.get(id)).filter(
      (g): g is Game => Boolean(g)
    );
  }, [games]);

  const carouselGames = useMemo(() => {
    const lead = featuredGames.find((g) => g.id === "froot-shooter") ?? featuredGames[0];
    if (!lead) return featuredGames;
    return [lead, ...featuredGames.filter((g) => g.id !== lead.id)];
  }, [featuredGames]);

  return (
    <div>
      {!query && (
        <p className="banner-text mb-4 text-center text-sm sm:text-base">
          Enter the gateway to hidden worlds of fun games
        </p>
      )}

      {!query && carouselGames.length > 0 && (
        <FeaturedCarousel games={carouselGames} />
      )}

      <h2 className="page-title mt-8 mb-6">
        {query ? "Search results" : "Featured games"}
      </h2>

      {loading ? (
        <p className="text-[var(--muted)]">Loading games...</p>
      ) : query ? (
        games.length === 0 ? (
          <p className="text-[var(--muted)]">No games found.</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
            {games.map((game) => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>
        )
      ) : featuredGames.length === 0 ? (
        <p className="text-[var(--muted)]">No games found.</p>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-8 xl:grid-cols-3">
          {featuredGames.map((game) => (
            <FeaturedGameCard key={game.id} game={game} />
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
