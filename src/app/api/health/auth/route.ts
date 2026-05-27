import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const authUrl = process.env.AUTH_URL ?? process.env.NEXTAUTH_URL ?? null;

  const status = {
    ok: true,
    authSecret: Boolean(process.env.AUTH_SECRET?.length),
    authUrl,
    authTrustHost: process.env.AUTH_TRUST_HOST === "true",
    googleId: Boolean(process.env.AUTH_GOOGLE_ID),
    googleSecret: Boolean(process.env.AUTH_GOOGLE_SECRET),
    database: false,
    authTables: false,
  };

  try {
    await prisma.$queryRaw`SELECT 1`;
    status.database = true;
    await prisma.user.count();
    status.authTables = true;
  } catch {
    status.ok = false;
    status.database = false;
    status.authTables = false;
  }

  if (
    !status.authSecret ||
    !status.googleId ||
    !status.googleSecret ||
    !status.database ||
    !status.authTables ||
    !authUrl?.startsWith("https://hideaway57.onrender.com")
  ) {
    status.ok = false;
  }

  return NextResponse.json(status);
}
