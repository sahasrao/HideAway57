import type { NextAuthConfig } from "next-auth";

const protectedPaths = [
  "/checkout",
  "/profile",
  "/library",
  "/order-confirmation",
];

export const authConfig = {
  trustHost: true,
  secret: process.env.AUTH_SECRET,
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: { strategy: "jwt" },
  providers: [],
  callbacks: {
    authorized({ auth, request }) {
      const path = request.nextUrl.pathname;
      const isProtected = protectedPaths.some(
        (p) => path === p || path.startsWith(`${p}/`)
      );
      if (isProtected && !auth?.user) return false;
      return true;
    },
    jwt({ token, user }) {
      if (user?.id) {
        token.id = user.id;
        token.sub = user.id;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
