import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/api-auth";
import { serializeGame } from "@/lib/games-db";

async function getCartItems(userId: string) {
  const items = await prisma.cartItem.findMany({
    where: { userId },
    include: { game: true },
  });
  return items.map((item) => ({
    game: serializeGame(item.game),
    quantity: item.quantity,
  }));
}

export async function GET() {
  const { user, response } = await requireUser();
  if (response) return response;
  const cart = await getCartItems(user!.id);
  return NextResponse.json(cart);
}

const addSchema = z.object({
  gameId: z.string(),
  quantity: z.number().int().min(1).optional(),
});

export async function POST(request: Request) {
  const { user, response } = await requireUser();
  if (response) return response;

  const body = await request.json();
  const parsed = addSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { gameId, quantity = 1 } = parsed.data;
  const game = await prisma.game.findUnique({ where: { id: gameId } });
  if (!game) {
    return NextResponse.json({ error: "Game not found" }, { status: 404 });
  }

  await prisma.cartItem.upsert({
    where: { userId_gameId: { userId: user!.id, gameId } },
    update: { quantity: { increment: quantity } },
    create: { userId: user!.id, gameId, quantity },
  });

  const cart = await getCartItems(user!.id);
  return NextResponse.json(cart);
}

export async function DELETE(request: Request) {
  const { user, response } = await requireUser();
  if (response) return response;

  const { searchParams } = new URL(request.url);
  const gameId = searchParams.get("gameId");
  if (!gameId) {
    return NextResponse.json({ error: "gameId required" }, { status: 400 });
  }

  await prisma.cartItem.deleteMany({
    where: { userId: user!.id, gameId },
  });

  const cart = await getCartItems(user!.id);
  return NextResponse.json(cart);
}
