import NextAuth from "next-auth";
import type { Provider } from "next-auth/providers";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { authConfig } from "@/auth.config";
import { prisma } from "@/lib/prisma";

const providers: Provider[] = [
  Credentials({
    name: "credentials",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
    },
    async authorize(credentials) {
      const email = credentials?.email as string | undefined;
      const password = credentials?.password as string | undefined;
      if (!email || !password) return null;

      const user = await prisma.user.findUnique({ where: { email } });
      if (!user?.passwordHash) return null;

      const valid = await bcrypt.compare(password, user.passwordHash);
      if (!valid) return null;

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image,
      };
    },
  }),
];

if (process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET) {
  providers.unshift(
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
      allowDangerousEmailAccountLinking: true,
    })
  );
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  secret: process.env.AUTH_SECRET,
  debug: process.env.AUTH_DEBUG === "true",
  adapter: PrismaAdapter(prisma),
  providers,
  events: {
    async signIn({ user, account }) {
      console.info("[auth] signIn", user.email, account?.provider);
    },
  },
  callbacks: {
    authorized: authConfig.callbacks?.authorized,
    async jwt({ token, user, profile, trigger, session }) {
      if (user?.id) {
        token.id = user.id;
      }

      if (user?.name !== undefined) {
        token.name = user.name;
      }

      const email =
        user?.email ??
        (typeof token.email === "string" ? token.email : undefined) ??
        (profile && typeof profile.email === "string" ? profile.email : undefined);

      if (email) {
        token.email = email;
      }

      if (!token.id && email) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { email },
            select: { id: true, name: true },
          });
          if (dbUser) {
            token.id = dbUser.id;
            if (dbUser.name !== undefined) {
              token.name = dbUser.name;
            }
          }
        } catch (error) {
          console.error("[auth] Failed to resolve user id from email:", error);
        }
      }

      if (trigger === "update" && session?.name !== undefined) {
        token.name = session.name;
      }

      if (token.id) {
        token.sub = token.id;
      }

      return token;
    },
    session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
        if (token.name !== undefined) {
          session.user.name = token.name;
        }
      }
      return session;
    },
  },
});
