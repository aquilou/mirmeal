import { redirect } from "next/navigation";
import { auth } from "@/auth";

/** Devuelve la sesión o redirige al login. Úsalo en páginas privadas. */
export async function requireUser() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  return session.user;
}

/** Exige rol ADMIN o redirige. Úsalo en las páginas del panel. */
export async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") redirect("/login");
  return session.user;
}
