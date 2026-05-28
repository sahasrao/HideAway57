"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import type { Game } from "@/types/game";
import { GameActions } from "@/components/GameActions";
import {
  getFeaturedCardImage,
  getGameBannerImage,
} from "@/lib/game-assets";
import { formatPrice } from "@/lib/pricing";

function bannerSrc(gameId: string) {
  return getGameBannerImage(gameId);
}

export default function GameDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [game, setGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);
  const [bannerFallback, setBannerFallback] = useState(false);

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/games/${id}`);
      if (res.ok) setGame(await res.json());
      setLoading(false);
    }
    load();
  }, [id]);

  useEffect(() => {
    setBannerFallback(false);
  }, [id]);

  if (loading) return <p className="text-[var(--muted)]">Loading game...</p>;

  if (!game) {
    return (
      <div>
        <h1 className="page-title">Not found</h1>
        <Link href="/" className="mt-4 text-[var(--teal)] hover:underline">
          ← Back to games
        </Link>
      </div>
    );
  }

  const bannerImage = bannerFallback
    ? getFeaturedCardImage(game.id)
    : bannerSrc(game.id);

  const published = new Date(game.publishedDate).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div>
      <Link href="/" className="text-sm text-[var(--teal)] hover:underline">
        ← Back to games
      </Link>

      <article className="mt-4 w-full overflow-hidden rounded-xl border border-[#3a3a3a] shadow-[0_4px_12px_rgba(0,0,0,0.35)]">
        <div className="relative aspect-[415/240] w-full bg-[#141414]">
          <Image
            src={bannerImage}
            alt={game.title}
            fill
            className="object-cover object-center"
            priority
            quality={100}
            unoptimized
            sizes="(max-width: 1024px) 100vw, calc(100vw - 302px)"
            onError={() => setBannerFallback(true)}
          />
        </div>

        <div className="flex flex-col gap-6 bg-[var(--panel)] p-6 sm:flex-row sm:items-start sm:justify-between sm:gap-8 sm:p-8">
          <div className="min-w-0 flex-1">
            <h1 className="text-lg font-black uppercase leading-tight text-white sm:text-xl">
              {game.title}
            </h1>
            <p className="mt-2 text-2xl font-bold text-white">
              {formatPrice(game.price)}
            </p>
            <p className="mt-4 text-sm leading-relaxed text-white/90 sm:text-base">
              {game.concept}
            </p>

            <dl className="mt-6 grid gap-4 border-t border-[#444] pt-6 text-sm sm:grid-cols-3">
              <div>
                <dt className="font-semibold uppercase tracking-wide text-[var(--muted)]">
                  Publisher
                </dt>
                <dd className="mt-1 font-semibold text-white">{game.publisher}</dd>
              </div>
              <div>
                <dt className="font-semibold uppercase tracking-wide text-[var(--muted)]">
                  Released
                </dt>
                <dd className="mt-1 font-semibold text-white">{published}</dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="font-semibold uppercase tracking-wide text-[var(--muted)]">
                  Platforms
                </dt>
                <dd className="mt-1 font-semibold text-white">
                  {game.platforms.join(", ")}
                </dd>
              </div>
            </dl>
          </div>

          <GameActions game={game} layout="detail" />
        </div>
      </article>
    </div>
  );
}
