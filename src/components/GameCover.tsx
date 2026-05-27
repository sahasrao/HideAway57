import Image from "next/image";
import type { Game } from "@/types/game";

export function GameCover({
  game,
  className = "",
  showTitle = false,
}: {
  game: Game;
  className?: string;
  showTitle?: boolean;
}) {
  return (
    <div className={`relative overflow-hidden bg-[#1a1a1a] ${className}`}>
      <Image
        src={game.coverImage}
        alt={game.title}
        fill
        className="object-cover"
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
      />
      {showTitle && (
        <div className="absolute inset-0 flex items-end justify-center bg-black/30 p-3">
          <span className="text-center text-xs font-black uppercase text-[var(--pink)] drop-shadow-lg">
            {game.title}
          </span>
        </div>
      )}
    </div>
  );
}
