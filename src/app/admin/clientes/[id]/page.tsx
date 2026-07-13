import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatEuros } from "@/lib/format";
import { ORDER_STATUS_LABEL, ORDER_STATUS_COLOR } from "@/lib/order-status";

export const dynamic = "force-dynamic";

export default async function ClienteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const customer = await prisma.user.findUnique({
    where: { id },
    include: {
      addresses: true,
      orders: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!customer) notFound();

  return (
    <div style={{ maxWidth: 720 }}>
      <Link href="/admin/clientes" style={{ fontSize: 13.5, color: "var(--g600)", textDecoration: "none" }}>
        ← Clientes
      </Link>
      <h1 style={{ fontSize: 28, margin: "10px 0 6px" }}>{customer.name || customer.email}</h1>
      <p style={{ color: "var(--g600)", marginBottom: 24, fontSize: 14 }}>
        {customer.email}
        {customer.phone && ` · ${customer.phone}`}
      </p>

      <h2 style={sectionTitle}>Direcciones</h2>
      {customer.addresses.length === 0 ? (
        <p style={{ color: "var(--g600)", fontSize: 14, marginBottom: 24 }}>Sin direcciones guardadas.</p>
      ) : (
        <div style={{ border: "1px solid var(--g100)", borderRadius: 12, overflow: "hidden", marginBottom: 24 }}>
          {customer.addresses.map((a, i) => (
            <div key={a.id} style={{ padding: "10px 16px", borderTop: i === 0 ? "none" : "1px solid var(--g100)", fontSize: 14 }}>
              {a.label && <strong>{a.label}: </strong>}
              {a.street}, {a.city} ({a.postalCode})
            </div>
          ))}
        </div>
      )}

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <h2 style={{ ...sectionTitle, marginBottom: 0 }}>Pedidos</h2>
        <Link
          href={`/admin/pedidos/nuevo?customerId=${customer.id}`}
          style={{ fontSize: 13.5, color: "var(--ink)", textDecoration: "underline" }}
        >
          Crear pedido para este cliente
        </Link>
      </div>
      {customer.orders.length === 0 ? (
        <p style={{ color: "var(--g600)", fontSize: 14 }}>Todavía no tiene pedidos.</p>
      ) : (
        <div style={{ border: "1px solid var(--g100)", borderRadius: 12, overflow: "hidden" }}>
          {customer.orders.map((o, i) => (
            <Link
              key={o.id}
              href={`/admin/pedidos/${o.id}`}
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
              <span style={{ fontSize: 13, color: "var(--g600)", width: 90 }}>
                {new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "short", timeZone: "UTC" }).format(o.createdAt)}
              </span>
              <span style={{ fontSize: 12.5, fontWeight: 500, color: ORDER_STATUS_COLOR[o.status] }}>
                {ORDER_STATUS_LABEL[o.status]}
              </span>
              <span style={{ marginLeft: "auto", fontSize: 14 }}>{formatEuros(o.totalCents)}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

const sectionTitle: React.CSSProperties = { fontSize: 16, fontWeight: 500, marginBottom: 12 };
