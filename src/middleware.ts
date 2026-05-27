import { auth } from "@/auth";
import { NextResponse } from "next/server";

const protectedPaths = [
  "/checkout",
  "/profile",
  "/library",
  "/order-confirmation",
];

export default auth((req) => {
  const path = req.nextUrl.pathname;
  const isProtected = protectedPaths.some(
    (p) => path === p || path.startsWith(`${p}/`)
  );

  if (isProtected && !req.auth?.user) {
    const loginUrl = new URL("/login", req.nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", path);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/checkout", "/profile", "/library", "/order-confirmation"],
};
