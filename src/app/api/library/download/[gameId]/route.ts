import { createReadStream } from "fs";
import { stat } from "fs/promises";
import { Readable } from "stream";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getInstallerPath } from "@/lib/installers";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ gameId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { gameId } = await params;

  const ownsGame = await prisma.orderItem.findFirst({
    where: {
      gameId,
      order: { userId: session.user.id, status: "paid" },
    },
  });

  if (!ownsGame) {
    return new Response("You must purchase this game before downloading.", {
      status: 403,
    });
  }

  const game = await prisma.game.findUnique({ where: { id: gameId } });
  if (!game) {
    return new Response("Game not found", { status: 404 });
  }

  const filePath = getInstallerPath(game.installerFile);
  if (!filePath) {
    return new Response("Installer file not found", { status: 404 });
  }

  await prisma.libraryEntry.upsert({
    where: {
      userId_gameId: { userId: session.user.id, gameId },
    },
    update: { downloadedAt: new Date() },
    create: { userId: session.user.id, gameId },
  });

  const fileStat = await stat(filePath);
  const stream = createReadStream(filePath);
  const webStream = Readable.toWeb(stream) as ReadableStream;

  return new Response(webStream, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Length": String(fileStat.size),
      "Content-Disposition": `attachment; filename="${game.id}-installer.zip"`,
      "Cache-Control": "private, no-cache",
    },
  });
}
