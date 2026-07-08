"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { mondayFromInput } from "@/lib/week";

/** Crea (o reutiliza) el menú de una semana y lleva a su edición. */
export async function createWeek(formData: FormData) {
  await requireAdmin();
  const value = String(formData.get("weekStart") || "");
  if (!value) throw new Error("Falta la fecha de la semana");

  const monday = mondayFromInput(value);
  const existing = await prisma.weeklyMenu.findFirst({ where: { weekStart: monday } });
  const menu = existing ?? (await prisma.weeklyMenu.create({ data: { weekStart: monday } }));

  revalidatePath("/admin/menu");
  redirect(`/admin/menu/${menu.id}`);
}

/** Sincroniza los platos y cupos de una semana con lo marcado en el formulario. */
export async function saveWeekItems(formData: FormData) {
  await requireAdmin();
  const menuId = String(formData.get("menuId"));
  const selectedIds = formData.getAll("selected").map(String);

  const current = await prisma.menuItem.findMany({ where: { weeklyMenuId: menuId } });

  for (const dishId of selectedIds) {
    const capacity = Math.max(
      0,
      parseInt(String(formData.get(`capacity_${dishId}`) ?? "0"), 10) || 0
    );

    const priceRaw = String(formData.get(`price_${dishId}`) ?? "").trim();
    let priceCentsOverride: number | null = null;
    if (priceRaw) {
      const n = Number(priceRaw.replace(",", "."));
      if (isFinite(n) && n >= 0) priceCentsOverride = Math.round(n * 100);
    }

    await prisma.menuItem.upsert({
      where: { weeklyMenuId_dishId: { weeklyMenuId: menuId, dishId } },
      update: { capacity, priceCentsOverride },
      create: { weeklyMenuId: menuId, dishId, capacity, priceCentsOverride },
    });
  }

  // Quita los platos que se hayan desmarcado (si ya tienen pedidos, se conservan).
  const toDelete = current.filter((i) => !selectedIds.includes(i.dishId));
  for (const item of toDelete) {
    try {
      await prisma.menuItem.delete({ where: { id: item.id } });
    } catch {
      /* en uso por un pedido: se deja como está */
    }
  }

  revalidatePath(`/admin/menu/${menuId}`);
  redirect(`/admin/menu/${menuId}`);
}

export async function toggleWeekPublished(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const menu = await prisma.weeklyMenu.findUnique({ where: { id } });
  if (menu) {
    await prisma.weeklyMenu.update({ where: { id }, data: { published: !menu.published } });
  }
  revalidatePath(`/admin/menu/${id}`);
  revalidatePath("/admin/menu");
}

export async function deleteWeek(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  try {
    await prisma.weeklyMenu.delete({ where: { id } });
  } catch {
    /* si tiene pedidos asociados, no se borra */
  }
  revalidatePath("/admin/menu");
  redirect("/admin/menu");
}
