"use server";

import type { OrderStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { computeDeliveryDate } from "@/lib/delivery";
import { ORDER_STATUSES } from "@/lib/order-status";
import { CheckoutError, parseCartItems, resolveOrderLines, resolveOrCreateAddress } from "@/lib/checkout-shared";

export type UpdateStatusState = { updatedAt?: number };

/** Cambia el estado de un pedido. Si pasa a CANCELLED y ya se había contado el cupo, lo libera. */
export async function updateOrderStatus(
  _prevState: UpdateStatusState,
  formData: FormData
): Promise<UpdateStatusState> {
  await requireAdmin();
  const id = String(formData.get("id"));
  const statusRaw = String(formData.get("status"));
  if (!ORDER_STATUSES.includes(statusRaw as OrderStatus)) throw new Error("Estado no válido");
  const status = statusRaw as OrderStatus;

  await prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({ where: { id }, include: { items: true } });
    if (!order) return;

    if (status === "CANCELLED" && order.status !== "PENDING" && order.status !== "CANCELLED") {
      for (const item of order.items) {
        await tx.menuItem.update({
          where: { id: item.menuItemId },
          data: { sold: { decrement: item.quantity } },
        });
      }
    }

    await tx.order.update({ where: { id }, data: { status } });
  });

  revalidatePath("/admin/pedidos");
  revalidatePath(`/admin/pedidos/${id}`);
  return { updatedAt: Date.now() };
}

export type ManualOrderState = { error?: string };

/** Crea un pedido a mano (por teléfono, etc.): se da por cobrado, entra directo en PREPARING y descuenta cupo ya. */
export async function createManualOrder(
  _prevState: ManualOrderState,
  formData: FormData
): Promise<ManualOrderState> {
  await requireAdmin();

  const customerId = String(formData.get("customerId") ?? "");
  if (!customerId) return { error: "Elige un cliente." };

  const customer = await prisma.user.findUnique({ where: { id: customerId } });
  if (!customer) return { error: "Ese cliente no existe." };

  const deliveryDateRaw = String(formData.get("deliveryDate") ?? "");
  const deliveryDate = deliveryDateRaw ? new Date(deliveryDateRaw + "T00:00:00Z") : computeDeliveryDate(new Date());
  if (isNaN(deliveryDate.getTime())) return { error: "Fecha de entrega no válida." };

  let orderId: string;
  try {
    const cartItems = parseCartItems(formData.get("cartItems"));

    orderId = await prisma.$transaction(async (tx) => {
      const address = await resolveOrCreateAddress(tx, customerId, formData);
      const resolvedItems = await resolveOrderLines(tx, cartItems);
      const subtotalCents = resolvedItems.reduce((s, i) => s + i.unitPriceCents * i.quantity, 0);

      const created = await tx.order.create({
        data: {
          userId: customerId,
          addressId: address.id,
          status: "PREPARING",
          isManual: true,
          deliveryDate,
          subtotalCents,
          taxCents: 0,
          totalCents: subtotalCents,
          items: {
            create: resolvedItems.map((i) => ({
              menuItemId: i.menuItemId,
              quantity: i.quantity,
              unitPriceCents: i.unitPriceCents,
            })),
          },
        },
      });

      for (const item of resolvedItems) {
        await tx.menuItem.update({
          where: { id: item.menuItemId },
          data: { sold: { increment: item.quantity } },
        });
      }

      return created.id;
    });
  } catch (err) {
    if (err instanceof CheckoutError) return { error: err.message };
    throw err;
  }

  revalidatePath("/admin/pedidos");
  redirect(`/admin/pedidos/${orderId}`);
}
