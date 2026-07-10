import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { computeDeliveryDate } from "@/lib/delivery";
import { PackCheckoutForm } from "./pack-checkout-form";

export const dynamic = "force-dynamic";

export default async function PackCheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ cancelled?: string }>;
}) {
  const user = await requireUser("/pack/checkout");
  const { cancelled } = await searchParams;

  const [addresses, plan] = await Promise.all([
    prisma.address.findMany({ where: { userId: user.id }, orderBy: { isDefault: "desc" } }),
    prisma.pricingPlan.findUnique({ where: { type: "PACK_5" } }),
  ]);

  const deliveryDate = computeDeliveryDate(new Date());

  return (
    <PackCheckoutForm
      addresses={addresses}
      deliveryDate={deliveryDate.toISOString()}
      cancelled={!!cancelled}
      planName={plan?.name ?? "Pack semanal"}
      planPriceCents={plan?.priceCents ?? 0}
      planAvailable={!!plan?.active}
    />
  );
}
