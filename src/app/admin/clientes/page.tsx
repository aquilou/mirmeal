import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function ClientesPage() {
  const customers = await prisma.user.findMany({
    where: { role: "CUSTOMER" },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { orders: true } } },
  });

  return (
    <div style={{ maxWidth: 920 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 22 }}>
        <h1 style={{ fontSize: 30 }}>Clientes</h1>
        <Link
          href="/admin/clientes/nuevo"
          style={{
            background: "var(--ink)",
            color: "var(--paper)",
            padding: "10px 18px",
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 500,
            textDecoration: "none",
          }}
        >
          Nuevo cliente
        </Link>
      </div>

      {customers.length === 0 ? (
        <p style={{ color: "var(--g600)" }}>Todavía no hay clientes.</p>
      ) : (
        <div style={{ border: "1px solid var(--g100)", borderRadius: 12, overflow: "hidden" }}>
          {customers.map((c, i) => (
            <Link
              key={c.id}
              href={`/admin/clientes/${c.id}`}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                padding: "12px 16px",
                borderTop: i === 0 ? "none" : "1px solid var(--g100)",
                textDecoration: "none",
                color: "inherit",
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 15, fontWeight: 500 }}>{c.name || c.email}</div>
                <div style={{ fontSize: 12.5, color: "var(--g600)" }}>
                  {c.email}
                  {c.phone && ` · ${c.phone}`}
                </div>
              </div>
              <span style={{ fontSize: 12.5, color: "var(--g600)" }}>
                {c._count.orders} pedido{c._count.orders === 1 ? "" : "s"}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
