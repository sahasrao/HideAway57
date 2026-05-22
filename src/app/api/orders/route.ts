import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/api-auth";
import { serializeGame } from "@/lib/games-db";

export async function GET() {
  const { user, response } = await requireUser();
  if (response) return response;

  const orders = await prisma.order.findMany({
    where: { userId: user!.id },
    include: { items: { include: { game: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(
    orders.map((order) => ({
      id: order.id,
      status: order.status,
      subtotal: order.subtotal,
      tax: order.tax,
      processingFee: order.processingFee,
      total: order.total,
      email: order.email,
      createdAt: order.createdAt.toISOString(),
      items: order.items.map((item) => ({
        game: serializeGame(item.game),
        price: item.price,
        quantity: item.quantity,
      })),
    }))
  );
}
