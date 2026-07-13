import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentWeeklyMenu } from "@/lib/menu-query";
import { computeDeliveryDate } from "@/lib/delivery";
import { ManualOrderForm } from "./manual-order-form";

export const dynamic = "force-dynamic";

export default async function NuevoPedidoPage({
  searchParams,
}: {
  searchParams: Promise<{ customerId?: string }>;
}) {
  const { customerId } = await searchParams;

  const [customers, menu] = await Promise.all([
    prisma.user.findMany({
      where: { role: "CUSTOMER" },
      orderBy: { name: "asc" },
      include: { addresses: true },
    }),
    getCurrentWeeklyMenu(),
  ]);

  return (
    <div style={{ maxWidth: 640 }}>
      <Link href="/admin/pedidos" style={{ fontSize: 13.5, color: "var(--g600)", textDecoration: "none" }}>
        ← Pedidos
      </Link>
      <h1 style={{ fontSize: 28, margin: "10px 0 20px" }}>Nuevo pedido</h1>

      {customers.length === 0 ? (
        <p style={{ color: "var(--g600)" }}>
          Todavía no hay clientes. <Link href="/admin/clientes/nuevo" style={{ textDecoration: "underline", color: "var(--ink)" }}>Crea uno primero</Link>.
        </p>
      ) : !menu || menu.items.length === 0 ? (
        <p style={{ color: "var(--g600)" }}>No hay un menú publicado esta semana con platos disponibles.</p>
      ) : (
        <ManualOrderForm
          customers={customers.map((c) => ({
            id: c.id,
            name: c.name,
            email: c.email,
            addresses: c.addresses,
          }))}
          defaultCustomerId={customerId ?? ""}
          defaultDeliveryDate={computeDeliveryDate(new Date()).toISOString().slice(0, 10)}
          menuItems={menu.items.map((it) => ({
            menuItemId: it.id,
            name: it.dish.name,
            priceCents: it.priceCentsOverride ?? it.dish.priceCents,
            available: it.capacity - it.sold,
          }))}
        />
      )}
    </div>
  );
}
