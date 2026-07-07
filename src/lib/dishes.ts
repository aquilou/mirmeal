"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

function slugify(s: string) {
  return (
    s
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "plato"
  );
}

async function uniqueSlug(base: string, excludeId?: string) {
  let slug = base;
  let n = 1;
  // Evita colisiones de slug entre platos.
  while (true) {
    const existing = await prisma.dish.findUnique({ where: { slug } });
    if (!existing || existing.id === excludeId) return slug;
    n++;
    slug = `${base}-${n}`;
  }
}

const schema = z.object({
  name: z.string().trim().min(1, "El nombre es obligatorio").max(120),
  description: z.string().trim().max(500).optional().or(z.literal("")),
  price: z.string().trim().min(1, "El precio es obligatorio"),
  kcal: z.string().optional(),
  proteinG: z.string().optional(),
  carbsG: z.string().optional(),
  fatG: z.string().optional(),
  imageUrl: z.string().url().optional().or(z.literal("")),
});

function toCents(v: string): number {
  const n = Number(v.replace(",", "."));
  if (!isFinite(n) || n < 0) throw new Error("Precio no válido");
  return Math.round(n * 100);
}

function toIntOrNull(v?: string): number | null {
  if (!v || v.trim() === "") return null;
  const n = parseInt(v, 10);
  return isFinite(n) ? n : null;
}

export async function saveDish(formData: FormData) {
  await requireAdmin();

  const id = (formData.get("id") as string) || "";
  const parsed = schema.parse({
    name: formData.get("name"),
    description: formData.get("description") ?? "",
    price: formData.get("price"),
    kcal: formData.get("kcal") ?? "",
    proteinG: formData.get("proteinG") ?? "",
    carbsG: formData.get("carbsG") ?? "",
    fatG: formData.get("fatG") ?? "",
    imageUrl: formData.get("imageUrl") ?? "",
  });
  const allergenIds = formData.getAll("allergens").map(String);

  const data = {
    name: parsed.name,
    description: parsed.description || null,
    priceCents: toCents(parsed.price),
    kcal: toIntOrNull(parsed.kcal),
    proteinG: toIntOrNull(parsed.proteinG),
    carbsG: toIntOrNull(parsed.carbsG),
    fatG: toIntOrNull(parsed.fatG),
    imageUrl: parsed.imageUrl || null,
  };

  if (id) {
    await prisma.dish.update({
      where: { id },
      data: { ...data, allergens: { set: allergenIds.map((a) => ({ id: a })) } },
    });
  } else {
    const slug = await uniqueSlug(slugify(parsed.name));
    await prisma.dish.create({
      data: { ...data, slug, allergens: { connect: allergenIds.map((a) => ({ id: a })) } },
    });
  }

  revalidatePath("/admin/platos");
  redirect("/admin/platos");
}

export async function deleteDish(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  try {
    await prisma.dish.delete({ where: { id } });
  } catch {
    // Si el plato ya está usado en algún menú, no se puede borrar: se desactiva.
    await prisma.dish.update({ where: { id }, data: { active: false } });
  }
  revalidatePath("/admin/platos");
}

export async function toggleDishActive(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const dish = await prisma.dish.findUnique({ where: { id } });
  if (dish) {
    await prisma.dish.update({ where: { id }, data: { active: !dish.active } });
  }
  revalidatePath("/admin/platos");
}
