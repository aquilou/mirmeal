"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

const schema = z.object({
  name: z.string().trim().min(1, "El nombre es obligatorio").max(120),
  price: z.string().trim().min(1, "El precio es obligatorio"),
});

function toCents(v: string): number {
  const n = Number(v.replace(",", "."));
  if (!isFinite(n) || n < 0) throw new Error("Precio no válido");
  return Math.round(n * 100);
}

/** Crea o actualiza el plan del pack semanal de 5 platos (singleton por tipo). */
export async function savePlan(formData: FormData) {
  await requireAdmin();

  const parsed = schema.parse({
    name: formData.get("name"),
    price: formData.get("price"),
  });
  const active = formData.get("active") === "on";
  const priceCents = toCents(parsed.price);

  await prisma.pricingPlan.upsert({
    where: { type: "PACK_5" },
    update: { name: parsed.name, priceCents, active },
    create: { type: "PACK_5", name: parsed.name, priceCents, active, dishesCount: 5 },
  });

  revalidatePath("/admin/planes");
}
