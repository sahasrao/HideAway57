import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/api-auth";
import { serializeGame } from "@/lib/games-db";
import { getInstallerPath } from "@/lib/installers";

const schema = z.object({ gameId: z.string() });

export async function POST(request: Request) {
  const { user, response } = await requireUser();
  if (response) return response;

  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { gameId } = parsed.data;

  const ownsGame = await prisma.orderItem.findFirst({
    where: {
      gameId,
      order: { userId: user!.id, status: "paid" },
    },
  });

  if (!ownsGame) {
    return NextResponse.json(
      { error: "You must purchase this game before downloading." },
      { status: 403 }
    );
  }

  const game = await prisma.game.findUnique({ where: { id: gameId } });
  if (!game) {
    return NextResponse.json({ error: "Game not found" }, { status: 404 });
  }

  const installerPath = getInstallerPath(game.installerFile);
  if (!installerPath) {
    return NextResponse.json(
      { error: "Installer not available. Run npm run installers:build" },
      { status: 503 }
    );
  }

  return NextResponse.json({
    game: serializeGame(game),
    filename: `${game.id}-installer.zip`,
    downloadUrl: `/api/library/download/${gameId}`,
  });
}
