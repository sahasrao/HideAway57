import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

const { auth: middleware } = NextAuth({
  ...authConfig,
  secret: process.env.AUTH_SECRET,
});

export default middleware;

export const config = {
  matcher: ["/checkout", "/profile", "/library", "/order-confirmation"],
};
