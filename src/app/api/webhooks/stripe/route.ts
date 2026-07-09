import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";

export const runtime = "nodejs"; // stripe SDK + verificación de firma necesitan Node, no edge

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const orderId = session.metadata?.orderId;
  if (!orderId) return;

  const paymentIntentId =
    typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id ?? session.id;

  // Guard idempotente: si otro evento ya procesó este pedido, `count` será 0 y no se toca `sold`.
  const { count } = await prisma.order.updateMany({
    where: { id: orderId, status: "PENDING" },
    data: { status: "PREPARING", stripePaymentIntentId: paymentIntentId },
  });
  if (count === 0) return;

  const order = await prisma.order.findUnique({ where: { id: orderId }, include: { items: true } });
  if (!order) return;

  for (const item of order.items) {
    const menuItem = await prisma.menuItem.findUnique({
      where: { id: item.menuItemId },
      include: { dish: true },
    });
    if (!menuItem) continue;
    const available = menuItem.capacity - menuItem.sold;
    if (available < item.quantity) {
      // Se cobró pero ya no hay cupo: requiere intervención manual (contactar cliente, plato alternativo, reembolso).
      await prisma.order.update({
        where: { id: orderId },
        data: {
          status: "INCIDENT",
          notes: `Cupo insuficiente para "${menuItem.dish.name}" al confirmar el pago (pedía ${item.quantity}, quedaban ${Math.max(available, 0)}).`,
        },
      });
      continue;
    }
    await prisma.menuItem.update({
      where: { id: item.menuItemId },
      data: { sold: { increment: item.quantity } },
    });
  }
}

async function handleCheckoutExpired(session: Stripe.Checkout.Session) {
  const orderId = session.metadata?.orderId;
  if (!orderId) return;
  await prisma.order.updateMany({
    where: { id: orderId, status: "PENDING" },
    data: { status: "CANCELLED" },
  });
}

export async function POST(req: Request) {
  const signature = req.headers.get("stripe-signature");
  const rawBody = await req.text();
  if (!signature) {
    return NextResponse.json({ error: "Falta la firma" }, { status: 400 });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json({ error: "STRIPE_WEBHOOK_SECRET no configurado" }, { status: 500 });
  }

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch {
    return NextResponse.json({ error: "Firma no válida" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
  } else if (event.type === "checkout.session.expired") {
    await handleCheckoutExpired(event.data.object as Stripe.Checkout.Session);
  }

  return NextResponse.json({ received: true });
}
