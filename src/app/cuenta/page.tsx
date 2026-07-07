import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { signOut } from "@/auth";

export default async function CuentaPage() {
  const user = await requireUser();

  return (
    <main style={{ minHeight: "100vh", padding: 40, maxWidth: 700, margin: "0 auto" }}>
      <h1 style={{ fontSize: 32, marginBottom: 8 }}>Tu cuenta</h1>
      <p style={{ color: "var(--g600)", marginBottom: 24 }}>
        Hola, {user.name ?? user.email}.
      </p>

      {user.role === "ADMIN" && (
        <p style={{ marginBottom: 24 }}>
          <Link href="/admin" style={{ textDecoration: "underline" }}>
            Ir al panel de administración →
          </Link>
        </p>
      )}

      <form
        action={async () => {
          "use server";
          await signOut({ redirectTo: "/login" });
        }}
      >
        <button
          style={{
            height: 42,
            padding: "0 18px",
            background: "transparent",
            color: "var(--ink)",
            border: "1px solid var(--ink)",
            borderRadius: "var(--radius)",
            fontSize: 14,
            cursor: "pointer",
          }}
        >
          Cerrar sesión
        </button>
      </form>
    </main>
  );
}
