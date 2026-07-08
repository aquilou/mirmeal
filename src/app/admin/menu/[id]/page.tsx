import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { toggleWeekPublished } from "@/lib/menus";
import { weekLabel } from "@/lib/week";
import { WeekForm } from "./week-form";

export default async function EditarSemanaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [menu, dishes] = await Promise.all([
    prisma.weeklyMenu.findUnique({ where: { id }, include: { items: true } }),
    prisma.dish.findMany({ where: { active: true }, orderBy: { name: "asc" } }),
  ]);

  if (!menu) notFound();

  const rows = dishes.map((d) => {
    const item = menu.items.find((i) => i.dishId === d.id);
    return {
      id: d.id,
      name: d.name,
      priceCents: d.priceCents,
      imageUrl: d.imageUrl,
      inMenu: !!item,
      capacity: item?.capacity ?? 0,
      sold: item?.sold ?? 0,
      priceCentsOverride: item?.priceCentsOverride ?? null,
    };
  });

  return (
    <div style={{ maxWidth: 720 }}>
      <a href="/admin/menu" style={{ fontSize: 13.5, color: "var(--g600)", textDecoration: "none" }}>
        ← Menú semanal
      </a>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "10px 0 20px" }}>
        <h1 style={{ fontSize: 28 }}>{weekLabel(menu.weekStart)}</h1>
        <form action={toggleWeekPublished}>
          <input type="hidden" name="id" value={menu.id} />
          <button
            style={{
              height: 40,
              padding: "0 18px",
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 500,
              cursor: "pointer",
              fontFamily: "inherit",
              border: menu.published ? "1px solid var(--g200)" : "none",
              background: menu.published ? "transparent" : "var(--entregado)",
              color: menu.published ? "var(--g600)" : "var(--paper)",
            }}
          >
            {menu.published ? "Despublicar" : "Publicar"}
          </button>
        </form>
      </div>

      {dishes.length === 0 ? (
        <p style={{ color: "var(--g600)" }}>
          No hay platos activos en el catálogo. Crea platos primero en la sección «Platos».
        </p>
      ) : (
        <WeekForm menuId={menu.id} rows={rows} />
      )}
    </div>
  );
}
