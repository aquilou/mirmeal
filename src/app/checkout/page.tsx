import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { computeDeliveryDate } from "@/lib/delivery";
import { CheckoutForm } from "./checkout-form";

export const dynamic = "force-dynamic";

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ cancelled?: string }>;
}) {
  const user = await requireUser("/checkout");
  const { cancelled } = await searchParams;

  const addresses = await prisma.address.findMany({
    where: { userId: user.id },
    orderBy: { isDefault: "desc" },
  });

  const deliveryDate = computeDeliveryDate(new Date());

  return (
    <CheckoutForm
      addresses={addresses}
      deliveryDate={deliveryDate.toISOString()}
      cancelled={!!cancelled}
    />
  );
}
