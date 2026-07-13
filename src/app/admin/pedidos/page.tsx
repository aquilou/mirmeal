import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatEuros } from "@/lib/format";
import { ORDER_STATUSES, ORDER_STATUS_LABEL, ORDER_STATUS_COLOR } from "@/lib/order-status";
import type { OrderStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

export default async function PedidosPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const validStatus = ORDER_STATUSES.includes(status as OrderStatus) ? (status as OrderStatus) : undefined;

  const orders = await prisma.order.findMany({
    where: validStatus ? { status: validStatus } : undefined,
    orderBy: { createdAt: "desc" },
    include: { user: true },
  });

  return (
    <div style={{ maxWidth: 960 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 22, flexWrap: "wrap", gap: 12 }}>
        <h1 style={{ fontSize: 30 }}>Pedidos</h1>
        <Link
          href="/admin/pedidos/nuevo"
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
          Nuevo pedido
        </Link>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
        <Link href="/admin/pedidos" style={filterChip(!validStatus)}>Todos</Link>
        {ORDER_STATUSES.map((s) => (
          <Link key={s} href={`/admin/pedidos?status=${s}`} style={filterChip(validStatus === s)}>
            {ORDER_STATUS_LABEL[s]}
          </Link>
        ))}
      </div>

      {orders.length === 0 ? (
        <p style={{ color: "var(--g600)" }}>No hay pedidos con ese filtro.</p>
      ) : (
        <div style={{ border: "1px solid var(--g100)", borderRadius: 12, overflow: "hidden" }}>
          {orders.map((o, i) => (
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
                flexWrap: "wrap",
              }}
            >
              <span style={{ fontSize: 13, color: "var(--g600)", width: 90 }}>
                {new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "short", timeZone: "UTC" }).format(o.createdAt)}
              </span>
              <div style={{ flex: 1, minWidth: 140 }}>
                <div style={{ fontSize: 14.5, fontWeight: 500 }}>{o.user.name || o.user.email}</div>
                <div style={{ fontSize: 12, color: "var(--g600)" }}>
                  Entrega {new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "short", timeZone: "UTC" }).format(o.deliveryDate)}
                  {o.isManual && " · manual"}
                </div>
              </div>
              <span style={{ fontSize: 12.5, fontWeight: 500, color: ORDER_STATUS_COLOR[o.status] }}>
                {ORDER_STATUS_LABEL[o.status]}
              </span>
              <span style={{ fontSize: 14.5, minWidth: 66, textAlign: "right" }}>{formatEuros(o.totalCents)}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function filterChip(active: boolean): React.CSSProperties {
  return {
    fontSize: 12.5,
    padding: "6px 12px",
    borderRadius: 999,
    textDecoration: "none",
    border: active ? "1px solid var(--ink)" : "1px solid var(--g200)",
    background: active ? "var(--ink)" : "transparent",
    color: active ? "var(--paper)" : "var(--g600)",
  };
}
