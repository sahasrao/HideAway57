import type { Game as PrismaGame } from "@/generated/prisma/client";
import type { Game } from "@/types/game";

export function serializeGame(game: PrismaGame): Game {
  return {
    id: game.id,
    title: game.title,
    price: game.price,
    concept: game.concept,
    platforms: JSON.parse(game.platforms) as string[],
    genre: game.genre,
    publisher: game.publisher,
    publishedDate: game.publishedDate.toISOString().split("T")[0],
    coverImage: game.coverImage,
    coverGradient: game.coverGradient ?? undefined,
  };
}
