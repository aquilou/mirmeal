import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatEuros } from "@/lib/format";
import { ORDER_STATUSES, ORDER_STATUS_LABEL, ORDER_STATUS_COLOR } from "@/lib/order-status";
import { updateOrderStatus } from "@/lib/order-admin";

export const dynamic = "force-dynamic";

function formatDate(d: Date) {
  return new Intl.DateTimeFormat("es-ES", { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" }).format(d);
}

export default async function PedidoDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      user: true,
      address: true,
      plan: true,
      items: { include: { menuItem: { include: { dish: true } } } },
    },
  });

  if (!order) notFound();

  return (
    <div style={{ maxWidth: 640 }}>
      <Link href="/admin/pedidos" style={{ fontSize: 13.5, color: "var(--g600)", textDecoration: "none" }}>
        ← Pedidos
      </Link>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "10px 0 20px", flexWrap: "wrap", gap: 12 }}>
        <h1 style={{ fontSize: 28 }}>Pedido {order.id.slice(-8)}</h1>
        <span style={{ fontSize: 13, fontWeight: 500, color: ORDER_STATUS_COLOR[order.status] }}>
          {ORDER_STATUS_LABEL[order.status]}
          {order.isManual && " · manual"}
        </span>
      </div>

      <section style={{ marginBottom: 24 }}>
        <h2 style={sectionTitle}>Cliente</h2>
        <p style={{ fontSize: 14.5 }}>
          <Link href={`/admin/clientes/${order.userId}`} style={{ color: "var(--ink)", textDecoration: "underline" }}>
            {order.user.name || order.user.email}
          </Link>{" "}
          · {order.user.email}
          {order.user.phone && ` · ${order.user.phone}`}
        </p>
      </section>

      <section style={{ marginBottom: 24 }}>
        <h2 style={sectionTitle}>Entrega</h2>
        <p style={{ fontSize: 14.5 }}>
          {formatDate(order.deliveryDate)}
          <br />
          {order.address.street}, {order.address.city} ({order.address.postalCode})
          {order.address.notes && <><br /><span style={{ color: "var(--g600)", fontSize: 13 }}>{order.address.notes}</span></>}
        </p>
      </section>

      <section style={{ marginBottom: 24 }}>
        <h2 style={sectionTitle}>{order.plan ? order.plan.name : "Platos"}</h2>
        <div style={{ border: "1px solid var(--g100)", borderRadius: 12, overflow: "hidden" }}>
          {order.items.map((it, i) => (
            <div
              key={it.id}
              style={{ display: "flex", justifyContent: "space-between", padding: "10px 16px", borderTop: i === 0 ? "none" : "1px solid var(--g100)", fontSize: 14 }}
            >
              <span>{it.quantity}× {it.menuItem.dish.name}</span>
              {!order.plan && <span>{formatEuros(it.unitPriceCents * it.quantity)}</span>}
            </div>
          ))}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12, fontSize: 14.5 }}>
          <span style={{ color: "var(--g600)" }}>Subtotal</span>
          <span>{formatEuros(order.subtotalCents)}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14.5 }}>
          <span style={{ color: "var(--g600)" }}>Impuestos</span>
          <span>{formatEuros(order.taxCents)}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4, fontSize: 17, fontFamily: "var(--font-display)" }}>
          <span>Total</span>
          <span>{formatEuros(order.totalCents)}</span>
        </div>
      </section>

      {order.notes && (
        <section style={{ marginBottom: 24 }}>
          <h2 style={sectionTitle}>Notas</h2>
          <p style={{ fontSize: 13.5, color: "var(--g600)" }}>{order.notes}</p>
        </section>
      )}

      {order.stripePaymentIntentId && (
        <section style={{ marginBottom: 24 }}>
          <h2 style={sectionTitle}>Stripe</h2>
          <p style={{ fontSize: 13, color: "var(--g600)", wordBreak: "break-all" }}>{order.stripePaymentIntentId}</p>
        </section>
      )}

      <section>
        <h2 style={sectionTitle}>Cambiar estado</h2>
        <form action={updateOrderStatus} style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <input type="hidden" name="id" value={order.id} />
          <select name="status" defaultValue={order.status} style={select}>
            {ORDER_STATUSES.map((s) => (
              <option key={s} value={s}>{ORDER_STATUS_LABEL[s]}</option>
            ))}
          </select>
          <button type="submit" style={saveBtn}>Guardar</button>
        </form>
      </section>
    </div>
  );
}

const sectionTitle: React.CSSProperties = { fontSize: 16, fontWeight: 500, marginBottom: 10 };
const select: React.CSSProperties = {
  height: 42,
  padding: "0 12px",
  fontSize: 14.5,
  border: "1px solid var(--g200)",
  borderRadius: 8,
  fontFamily: "inherit",
};
const saveBtn: React.CSSProperties = {
  height: 42,
  padding: "0 18px",
  background: "var(--ink)",
  color: "var(--paper)",
  border: "none",
  borderRadius: 8,
  fontSize: 14,
  fontWeight: 500,
  cursor: "pointer",
  fontFamily: "inherit",
};
