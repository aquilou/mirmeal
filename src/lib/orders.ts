"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { getStripe } from "@/lib/stripe";
import { computeDeliveryDate } from "@/lib/delivery";
import type { Prisma } from "@prisma/client";

/** Error de negocio (dirección inválida, sin cupo, carrito vacío): se muestra tal cual al usuario. */
class CheckoutError extends Error {}

const cartItemSchema = z.object({
  menuItemId: z.string().min(1),
  quantity: z.number().int().min(1),
});

const addressSchema = z.object({
  label: z.string().trim().max(60).optional().or(z.literal("")),
  street: z.string().trim().min(1, "La calle es obligatoria").max(200),
  city: z.string().trim().min(1, "La ciudad es obligatoria").max(120),
  postalCode: z.string().trim().min(1, "El código postal es obligatorio").max(12),
  notes: z.string().trim().max(300).optional().or(z.literal("")),
});

function parseCartItems(raw: FormDataEntryValue | null) {
  if (!raw || typeof raw !== "string") throw new CheckoutError("Tu pedido está vacío.");
  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch {
    throw new CheckoutError("Tu pedido no es válido. Vuelve al carrito e inténtalo de nuevo.");
  }
  const parsed = z.array(cartItemSchema).min(1, "Tu pedido está vacío.").safeParse(json);
  if (!parsed.success) throw new CheckoutError("Tu pedido no es válido. Vuelve al carrito e inténtalo de nuevo.");
  return parsed.data;
}

async function resolveOrCreateAddress(
  tx: Prisma.TransactionClient,
  userId: string,
  formData: FormData
) {
  const addressId = String(formData.get("addressId") ?? "");

  if (addressId && addressId !== "new") {
    const existing = await tx.address.findFirst({ where: { id: addressId, userId } });
    if (!existing) throw new CheckoutError("La dirección seleccionada no es válida.");
    return existing;
  }

  const parsed = addressSchema.safeParse({
    label: formData.get("label") ?? "",
    street: formData.get("street") ?? "",
    city: formData.get("city") ?? "",
    postalCode: formData.get("postalCode") ?? "",
    notes: formData.get("notes") ?? "",
  });
  if (!parsed.success) {
    throw new CheckoutError(parsed.error.issues[0]?.message ?? "Revisa los datos de la dirección.");
  }

  const hasAddresses = (await tx.address.count({ where: { userId } })) > 0;

  return tx.address.create({
    data: {
      userId,
      label: parsed.data.label || null,
      street: parsed.data.street,
      city: parsed.data.city,
      postalCode: parsed.data.postalCode,
      notes: parsed.data.notes || null,
      isDefault: !hasAddresses,
    },
  });
}

export type CheckoutState = { error?: string };

/** Crea el pedido (revalidando cupo y precio en servidor) y redirige a Stripe Checkout. */
export async function startCheckout(
  _prevState: CheckoutState,
  formData: FormData
): Promise<CheckoutState> {
  const user = await requireUser("/checkout");
  const cartItems = parseCartItems(formData.get("cartItems"));

  let order;
  let lineItems: { name: string; unitPriceCents: number; quantity: number }[];
  try {
    const result = await prisma.$transaction(async (tx) => {
      const address = await resolveOrCreateAddress(tx, user.id, formData);

      const resolvedItems: { name: string; unitPriceCents: number; quantity: number }[] = [];
      for (const item of cartItems) {
        const menuItem = await tx.menuItem.findUnique({
          where: { id: item.menuItemId },
          include: { dish: true },
        });
        if (!menuItem) throw new CheckoutError("Alguno de los platos de tu pedido ya no está disponible.");
        const available = menuItem.capacity - menuItem.sold;
        if (available < item.quantity) {
          throw new CheckoutError(`Ya no quedan suficientes unidades de "${menuItem.dish.name}".`);
        }
        resolvedItems.push({
          name: menuItem.dish.name,
          unitPriceCents: menuItem.priceCentsOverride ?? menuItem.dish.priceCents,
          quantity: item.quantity,
        });
      }

      const subtotalCents = resolvedItems.reduce((s, i) => s + i.unitPriceCents * i.quantity, 0);
      const deliveryDate = computeDeliveryDate(new Date());

      const created = await tx.order.create({
        data: {
          userId: user.id,
          addressId: address.id,
          status: "PENDING",
          deliveryDate,
          subtotalCents,
          taxCents: 0,
          totalCents: subtotalCents,
          items: {
            create: cartItems.map((item, i) => ({
              menuItemId: item.menuItemId,
              quantity: item.quantity,
              unitPriceCents: resolvedItems[i].unitPriceCents,
            })),
          },
        },
      });

      return { order: created, resolvedItems };
    });
    order = result.order;
    lineItems = result.resolvedItems;
  } catch (err) {
    if (err instanceof CheckoutError) return { error: err.message };
    throw err;
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  let sessionUrl: string | null;
  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: lineItems.map((i) => ({
        quantity: i.quantity,
        price_data: {
          currency: "eur",
          unit_amount: i.unitPriceCents,
          product_data: { name: i.name },
        },
      })),
      success_url: `${appUrl}/checkout/success?order=${order.id}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/checkout?cancelled=1`,
      client_reference_id: order.id,
      metadata: { orderId: order.id },
    });
    await prisma.order.update({
      where: { id: order.id },
      data: { stripePaymentIntentId: session.id },
    });
    sessionUrl = session.url;
  } catch (err) {
    await prisma.order.update({ where: { id: order.id }, data: { status: "CANCELLED" } });
    const message = err instanceof Error ? err.message : "No se pudo iniciar el pago.";
    return { error: message };
  }

  if (!sessionUrl) {
    await prisma.order.update({ where: { id: order.id }, data: { status: "CANCELLED" } });
    return { error: "No se pudo iniciar el pago." };
  }

  redirect(sessionUrl);
}
