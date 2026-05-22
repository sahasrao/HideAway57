import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/api-auth";
import { serializeGame } from "@/lib/games-db";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, response } = await requireUser();
  if (response) return response;

  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get("session_id");

  const order = sessionId
    ? await prisma.order.findFirst({
        where: { stripeSessionId: sessionId, userId: user!.id },
        include: { items: { include: { game: true } } },
      })
    : await prisma.order.findFirst({
        where: { id, userId: user!.id },
        include: { items: { include: { game: true } } },
      });

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  return NextResponse.json({
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
  });
}
