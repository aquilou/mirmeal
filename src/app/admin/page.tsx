import { requireAdmin } from "@/lib/auth";
import { signOut } from "@/auth";

export default async function AdminHome() {
  const user = await requireAdmin();

  return (
    <main style={{ minHeight: "100vh", padding: 40, maxWidth: 900, margin: "0 auto" }}>
      <h1 style={{ fontSize: 32, marginBottom: 8 }}>Panel de administración</h1>
      <p style={{ color: "var(--g600)", marginBottom: 24 }}>
        Hola, {user.name ?? user.email}. Rol: {user.role}.
      </p>
      <p style={{ color: "var(--g600)", marginBottom: 24 }}>
        Acceso restringido correcto: solo usuarios con rol ADMIN llegan aquí.
        Desde aquí montaremos las secciones (menú semanal, pedidos, clientes…).
      </p>
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
