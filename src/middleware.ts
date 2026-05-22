import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
  const token = await getToken({
    req,
    secret: process.env.AUTH_SECRET,
  });

  const path = req.nextUrl.pathname;
  const protectedPaths = [
    "/checkout",
    "/profile",
    "/library",
    "/order-confirmation",
  ];
  const isProtected = protectedPaths.some(
    (p) => path === p || path.startsWith(`${p}/`)
  );

  if (isProtected && !token) {
    const loginUrl = new URL("/login", req.nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", path);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/checkout", "/profile", "/library", "/order-confirmation"],
};
