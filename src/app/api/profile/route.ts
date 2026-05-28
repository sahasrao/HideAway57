import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/api-auth";
import { normalizeAvatarTheme } from "@/lib/avatar-theme";

const hexColor = z
  .string()
  .regex(/^#[0-9a-fA-F]{6}$/, "Invalid color")
  .transform((value) => value.toLowerCase());

const updateSchema = z
  .object({
    name: z.string().trim().min(1, "Name is required").max(80).optional(),
    avatarBodyColor: hexColor.optional(),
    avatarAccentColor: hexColor.optional(),
  })
  .refine(
    (data) =>
      data.name !== undefined ||
      data.avatarBodyColor !== undefined ||
      data.avatarAccentColor !== undefined,
    { message: "Nothing to update" }
  );

export async function GET() {
  const { user, response } = await requireUser();
  if (response) return response;

  try {
    const dbUser = await prisma.user.findUnique({
      where: { id: user!.id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        avatarBodyColor: true,
        avatarAccentColor: true,
        createdAt: true,
        _count: { select: { orders: true, library: true } },
      },
    });

    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const orders = dbUser._count.orders;
    const library = dbUser._count.library;
    const avatar = normalizeAvatarTheme(
      dbUser.avatarBodyColor,
      dbUser.avatarAccentColor
    );

    return NextResponse.json({
      id: dbUser.id,
      name: dbUser.name,
      email: dbUser.email,
      image: dbUser.image,
      avatarBodyColor: avatar.bodyColor,
      avatarAccentColor: avatar.accentColor,
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
  } catch (error) {
    console.error("[profile GET]", error);
    return NextResponse.json(
      { error: "Failed to load profile" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  const { user, response } = await requireUser();
  if (response) return response;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    const message =
      parsed.error.issues[0]?.message ?? "Invalid profile data";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  try {
    const updated = await prisma.user.update({
      where: { id: user!.id },
      data: parsed.data,
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        avatarBodyColor: true,
        avatarAccentColor: true,
      },
    });

    const avatar = normalizeAvatarTheme(
      updated.avatarBodyColor,
      updated.avatarAccentColor
    );

    return NextResponse.json({
      ...updated,
      avatarBodyColor: avatar.bodyColor,
      avatarAccentColor: avatar.accentColor,
    });
  } catch (error) {
    console.error("[profile PATCH]", error);
    return NextResponse.json(
      { error: "Failed to save profile. Try again." },
      { status: 500 }
    );
  }
}
