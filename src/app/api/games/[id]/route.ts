import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serializeGame } from "@/lib/games-db";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const game = await prisma.game.findUnique({ where: { id } });
  if (!game) {
    return NextResponse.json({ error: "Game not found" }, { status: 404 });
  }
  return NextResponse.json(serializeGame(game));
}
