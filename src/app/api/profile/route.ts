import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/api-auth";

export async function GET() {
  const { user, response } = await requireUser();
  if (response) return response;

  const dbUser = await prisma.user.findUnique({
    where: { id: user!.id },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      createdAt: true,
      _count: { select: { orders: true, library: true } },
    },
  });

  if (!dbUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const orders = dbUser._count.orders;
  const library = dbUser._count.library;

  return NextResponse.json({
    id: dbUser.id,
    name: dbUser.name,
    email: dbUser.email,
    image: dbUser.image,
    createdAt: dbUser.createdAt.toISOString(),
    orderCount: orders,
    libraryCount: library,
    systemRank: 25800 + orders * 120 + library * 80,
    xpLevel: Math.min(99, 57 + library * 2),
    skillRank:
      library >= 5 ? "Mega Pro" : library >= 2 ? "Pro" : "Rookie",
    coins: 4000 + library * 500 + orders * 200,
    achievementCount: Math.min(5, library + orders),
  });
}

const updateSchema = z.object({
  name: z.string().min(1).max(80).optional(),
});

export async function PATCH(request: Request) {
  const { user, response } = await requireUser();
  if (response) return response;

  const body = await request.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }

  const updated = await prisma.user.update({
    where: { id: user!.id },
    data: parsed.data,
    select: { id: true, name: true, email: true, image: true },
  });

  return NextResponse.json(updated);
}
