import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { formatEuros } from "@/lib/format";
import { ClearCartOnMount } from "../clear-cart-on-mount";

export const dynamic = "force-dynamic";

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const user = await requireUser("/checkout");
  const { order: orderId } = await searchParams;

  const order = orderId
    ? await prisma.order.findFirst({
        where: { id: orderId, userId: user.id },
        include: { address: true, items: { include: { menuItem: { include: { dish: true } } } } },
      })
    : null;

  if (!order) {
    return (
      <div style={{ maxWidth: 560, margin: "0 auto", padding: "60px 24px", textAlign: "center" }}>
        <p style={{ color: "var(--g600)" }}>No hemos encontrado ese pedido.</p>
        <Link href="/menu" style={{ textDecoration: "underline", color: "var(--ink)" }}>Volver al menú</Link>
      </div>
    );
  }

  const confirmed = order.status !== "PENDING";

  return (
    <div style={{ maxWidth: 560, margin: "0 auto", padding: "60px 24px 90px", textAlign: "center" }}>
      <ClearCartOnMount />
      <h1 style={{ fontSize: 30, marginBottom: 14 }}>
        {confirmed ? "¡Pedido confirmado!" : "Confirmando tu pago…"}
      </h1>
      <p style={{ color: "var(--g600)", marginBottom: 28 }}>
        {confirmed
          ? `Entrega prevista: ${new Intl.DateTimeFormat("es-ES", { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" }).format(order.deliveryDate)} en ${order.address.street}, ${order.address.city}.`
          : "Estamos esperando la confirmación de Stripe. Actualiza esta página en unos segundos si no cambia."}
      </p>

      <div style={{ border: "1px solid var(--g100)", borderRadius: 12, overflow: "hidden", textAlign: "left" }}>
        {order.items.map((it, i) => (
          <div
            key={it.id}
            style={{ display: "flex", justifyContent: "space-between", padding: "12px 16px", borderTop: i === 0 ? "none" : "1px solid var(--g100)", fontSize: 14.5 }}
          >
            <span>{it.quantity}× {it.menuItem.dish.name}</span>
            <span>{formatEuros(it.unitPriceCents * it.quantity)}</span>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 14 }}>
        <span style={{ fontSize: 15, color: "var(--g600)" }}>Total</span>
        <span style={{ fontFamily: "var(--font-display)", fontSize: 22 }}>{formatEuros(order.totalCents)}</span>
      </div>

      <Link href="/menu" style={{ display: "inline-block", marginTop: 28, textDecoration: "underline", color: "var(--ink)" }}>
        Seguir explorando el menú
      </Link>
    </div>
  );
}
