import { redirect } from "next/navigation";
import { auth } from "@/auth";

/** Devuelve la sesión o redirige al login. Úsalo en páginas privadas.
 *  Si se pasa `returnTo`, el login vuelve ahí tras autenticarse. */
export async function requireUser(returnTo?: string) {
  const session = await auth();
  if (!session?.user) {
    redirect(returnTo ? `/login?callbackUrl=${encodeURIComponent(returnTo)}` : "/login");
  }
  return session.user;
}

/** Exige rol ADMIN o redirige. Úsalo en las páginas del panel. */
export async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") redirect("/login");
  return session.user;
}
