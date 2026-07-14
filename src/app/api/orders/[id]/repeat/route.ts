import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getCurrentWeeklyMenu } from "@/lib/menu-query";

export const dynamic = "force-dynamic";

/** Traduce los platos de un pedido pasado a los MenuItem de la semana actual (con precio y cupo vigentes). */
export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }
  const { id } = await params;

  const order = await prisma.order.findFirst({
    where: { id, userId: session.user.id },
    include: { items: { include: { menuItem: { include: { dish: true } } } } },
  });
  if (!order) {
    return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 });
  }

  const menu = await getCurrentWeeklyMenu();
  const currentByDish = new Map((menu?.items ?? []).map((mi) => [mi.dishId, mi]));

  const items: {
    menuItemId: string;
    name: string;
    priceCents: number;
    imageUrl: string | null;
    quantity: number;
  }[] = [];
  const unavailable: string[] = [];

  for (const orderItem of order.items) {
    const dish = orderItem.menuItem.dish;
    const current = currentByDish.get(dish.id);
    const available = current ? current.capacity - current.sold : 0;
    if (!current || available < 1) {
      unavailable.push(dish.name);
      continue;
    }
    items.push({
      menuItemId: current.id,
      name: dish.name,
      priceCents: current.priceCentsOverride ?? dish.priceCents,
      imageUrl: dish.imageUrl,
      quantity: Math.min(orderItem.quantity, available),
    });
  }

  return NextResponse.json({ items, unavailable });
}
