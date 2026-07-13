import type { NextAuthConfig } from "next-auth";

// Configuración segura para el edge (middleware): sin Prisma ni bcrypt.
// El proveedor Credentials (que sí los usa) se añade en `auth.ts`.
export const authConfig = {
  // Necesario para servir la app en varios dominios (panel en Railway, compra en
  // app.mirmeal.es): sin esto, Auth.js puede construir URLs absolutas con el host
  // interno del contenedor en vez del dominio real por el que llegó la petición.
  trustHost: true,
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    // Protección de rutas usada por el middleware.
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const role = auth?.user?.role;
      const path = nextUrl.pathname;

      if (path.startsWith("/admin")) {
        return isLoggedIn && role === "ADMIN";
      }
      if (path.startsWith("/cuenta") || path.startsWith("/checkout") || path.startsWith("/pack/checkout")) {
        return isLoggedIn;
      }
      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.role = user.role;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = String(token.id);
        session.user.role = token.role as "ADMIN" | "KITCHEN" | "DELIVERY" | "CUSTOMER";
      }
      return session;
    },
  },
  providers: [], // se completan en auth.ts
} satisfies NextAuthConfig;
