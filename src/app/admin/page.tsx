import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function AdminHome() {
  const [dishes, allergens] = await Promise.all([
    prisma.dish.count(),
    prisma.allergen.count(),
  ]);

  return (
    <div style={{ maxWidth: 820 }}>
      <h1 style={{ fontSize: 30, marginBottom: 6 }}>Panel</h1>
      <p style={{ color: "var(--g600)", marginBottom: 28 }}>
        Bienvenido. Desde aquí gestionas el catálogo, el menú semanal y los pedidos.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 14 }}>
        <Link
          href="/admin/platos"
          style={{
            border: "1px solid var(--g100)",
            borderRadius: 12,
            padding: 20,
            textDecoration: "none",
            color: "var(--ink)",
          }}
        >
          <div style={{ fontFamily: "var(--font-display)", fontSize: 30 }}>{dishes}</div>
          <div style={{ fontSize: 14, color: "var(--g600)" }}>platos en el catálogo →</div>
        </Link>
        <div style={{ border: "1px solid var(--g100)", borderRadius: 12, padding: 20 }}>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 30 }}>{allergens}</div>
          <div style={{ fontSize: 14, color: "var(--g600)" }}>alérgenos configurados</div>
        </div>
      </div>
    </div>
  );
}
