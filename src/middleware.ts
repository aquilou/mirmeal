import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

// Usa solo la config edge-safe: la protección vive en el callback `authorized`.
export const { auth: middleware } = NextAuth(authConfig);

export const config = {
  matcher: ["/admin/:path*", "/cuenta/:path*"],
};
