"use client";

import Link from "next/link";
import { useStore } from "@/context/StoreContext";
import { GameCover } from "@/components/GameCover";

export default function LibraryPage() {
  const { library, libraryLoaded, downloadGame } = useStore();

  return (
    <div>
      <h1 className="page-title mb-8">Library</h1>

      {!libraryLoaded ? (
        <p className="text-[var(--muted)]">Loading library...</p>
      ) : library.length === 0 ? (
        <div className="panel p-12 text-center">
          <p className="text-white">No games in your library yet.</p>
          <Link href="/" className="btn-teal mt-6 inline-block px-6 py-2 text-sm">
            Browse games
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 grid-cols-2 md:grid-cols-3">
          {library.map((game) => (
            <article key={game.id} className="text-center">
              <Link href={`/games/${game.id}`} className="block overflow-hidden rounded border border-[#3a3a3a]">
                <GameCover game={game} className="aspect-square" />
              </Link>
              <h3 className="mt-2 text-sm font-bold text-white">{game.title}</h3>
              <button
                type="button"
                onClick={() => downloadGame(game.id)}
                className="btn-teal mt-2 px-4 py-1.5 text-xs"
              >
                Re-download
              </button>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
