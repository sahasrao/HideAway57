import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serializeGame } from "@/lib/games-db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim().toLowerCase();

  const games = await prisma.game.findMany({ orderBy: { title: "asc" } });
  let serialized = games.map(serializeGame);

  if (q) {
    serialized = serialized.filter(
      (g) =>
        g.title.toLowerCase().includes(q) ||
        g.genre.toLowerCase().includes(q) ||
        g.publisher.toLowerCase().includes(q)
    );
  }

  return NextResponse.json(serialized);
}
