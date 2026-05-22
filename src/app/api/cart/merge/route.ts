import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/api-auth";
import { serializeGame } from "@/lib/games-db";

const schema = z.array(
  z.object({
    gameId: z.string(),
    quantity: z.number().int().min(1),
  })
);

export async function POST(request: Request) {
  const { user, response } = await requireUser();
  if (response) return response;

  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid cart payload" }, { status: 400 });
  }

  for (const item of parsed.data) {
    const game = await prisma.game.findUnique({ where: { id: item.gameId } });
    if (!game) continue;

    await prisma.cartItem.upsert({
      where: { userId_gameId: { userId: user!.id, gameId: item.gameId } },
      update: { quantity: { increment: item.quantity } },
      create: {
        userId: user!.id,
        gameId: item.gameId,
        quantity: item.quantity,
      },
    });
  }

  const items = await prisma.cartItem.findMany({
    where: { userId: user!.id },
    include: { game: true },
  });

  return NextResponse.json(
    items.map((i) => ({ game: serializeGame(i.game), quantity: i.quantity }))
  );
}
