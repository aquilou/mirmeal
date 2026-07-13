"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { getStripe } from "@/lib/stripe";
import { computeDeliveryDate } from "@/lib/delivery";
import { CheckoutError, parseCartItems, resolveOrderLines, resolveOrCreateAddress } from "@/lib/checkout-shared";

const PACK_SIZE = 5;

const packItemsSchema = z.array(z.string().min(1)).length(PACK_SIZE, `Elige exactamente ${PACK_SIZE} platos.`);

function parsePackItems(raw: FormDataEntryValue | null): string[] {
  if (!raw || typeof raw !== "string") throw new CheckoutError("Elige tus 5 platos antes de continuar.");
  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch {
    throw new CheckoutError("Tu selección no es válida. Vuelve a elegir tus platos.");
  }
  const parsed = packItemsSchema.safeParse(json);
  if (!parsed.success) throw new CheckoutError(parsed.error.issues[0]?.message ?? "Elige exactamente 5 platos.");
  if (new Set(parsed.data).size !== PACK_SIZE) {
    throw new CheckoutError("No puedes repetir el mismo plato en el pack.");
  }
  return parsed.data;
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
      const resolvedItems = await resolveOrderLines(tx, cartItems);

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

/** Crea el pedido del pack semanal (precio fijo, 5 platos) y redirige a Stripe Checkout. */
export async function startPackCheckout(
  _prevState: CheckoutState,
  formData: FormData
): Promise<CheckoutState> {
  const user = await requireUser("/pack/checkout");
  const menuItemIds = parsePackItems(formData.get("menuItemIds"));

  let order;
  let planName: string;
  let totalCents: number;
  try {
    const result = await prisma.$transaction(async (tx) => {
      const plan = await tx.pricingPlan.findUnique({ where: { type: "PACK_5" } });
      if (!plan || !plan.active) {
        throw new CheckoutError("El pack semanal no está disponible ahora mismo.");
      }

      const address = await resolveOrCreateAddress(tx, user.id, formData);

      const resolvedItems: { menuItemId: string; unitPriceCents: number }[] = [];
      let weeklyMenuId: string | null = null;
      for (const menuItemId of menuItemIds) {
        const menuItem = await tx.menuItem.findUnique({
          where: { id: menuItemId },
          include: { dish: true },
        });
        if (!menuItem) throw new CheckoutError("Alguno de los platos elegidos ya no está disponible.");
        if (weeklyMenuId === null) weeklyMenuId = menuItem.weeklyMenuId;
        if (menuItem.weeklyMenuId !== weeklyMenuId) {
          throw new CheckoutError("Los platos elegidos deben ser de la misma semana. Vuelve a elegirlos.");
        }
        const available = menuItem.capacity - menuItem.sold;
        if (available < 1) {
          throw new CheckoutError(`Ya no queda cupo de "${menuItem.dish.name}".`);
        }
        resolvedItems.push({
          menuItemId,
          unitPriceCents: menuItem.priceCentsOverride ?? menuItem.dish.priceCents,
        });
      }

      const subtotalCents = resolvedItems.reduce((s, i) => s + i.unitPriceCents, 0);
      const deliveryDate = computeDeliveryDate(new Date());

      const created = await tx.order.create({
        data: {
          userId: user.id,
          addressId: address.id,
          planId: plan.id,
          status: "PENDING",
          deliveryDate,
          subtotalCents,
          taxCents: 0,
          totalCents: plan.priceCents,
          items: {
            create: resolvedItems.map((i) => ({
              menuItemId: i.menuItemId,
              quantity: 1,
              unitPriceCents: i.unitPriceCents,
            })),
          },
        },
      });

      return { order: created, planName: plan.name, totalCents: plan.priceCents };
    });
    order = result.order;
    planName = result.planName;
    totalCents = result.totalCents;
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
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "eur",
            unit_amount: totalCents,
            product_data: { name: planName },
          },
        },
      ],
      success_url: `${appUrl}/checkout/success?order=${order.id}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/pack?cancelled=1`,
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
