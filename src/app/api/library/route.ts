import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/api-auth";
import { serializeGame } from "@/lib/games-db";

export async function GET() {
  const { user, response } = await requireUser();
  if (response) return response;

  const entries = await prisma.libraryEntry.findMany({
    where: { userId: user!.id },
    include: { game: true },
    orderBy: { downloadedAt: "desc" },
  });

  return NextResponse.json(
    entries.map((e) => ({
      game: serializeGame(e.game),
      downloadedAt: e.downloadedAt.toISOString(),
    }))
  );
}
