import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { weekLabel } from "@/lib/week";
import { formatEuros } from "@/lib/format";
import { getCurrentWeeklyMenu } from "@/lib/menu-query";
import { PackGrid } from "./pack-grid";

export const dynamic = "force-dynamic";

export default async function PackPage() {
  const [menu, plan] = await Promise.all([
    getCurrentWeeklyMenu(),
    prisma.pricingPlan.findUnique({ where: { type: "PACK_5" } }),
  ]);

  if (!plan || !plan.active) {
    return (
      <div style={{ maxWidth: 560, margin: "0 auto", padding: "60px 24px", textAlign: "center" }}>
        <p style={{ color: "var(--g600)" }}>El pack semanal no está disponible todavía.</p>
        <Link href="/menu" style={{ textDecoration: "underline", color: "var(--ink)" }}>Ver la carta a la carta</Link>
      </div>
    );
  }

  return (
    <main style={{ maxWidth: 1080, margin: "0 auto", padding: "32px 20px 110px" }}>
      <Link href="/menu" style={{ fontSize: 13.5, color: "var(--g600)", textDecoration: "none" }}>
        ← Volver a la carta
      </Link>
      <h1 style={{ fontSize: "clamp(26px,5vw,40px)", margin: "12px 0 6px" }}>{plan.name}</h1>
      <p style={{ color: "var(--g600)", marginBottom: 4 }}>
        Elige 5 platos de la semana por {formatEuros(plan.priceCents)}.
      </p>
      {menu && <p style={{ color: "var(--g600)", marginBottom: 28, fontSize: 14 }}>{weekLabel(menu.weekStart)}</p>}

      {!menu || menu.items.length === 0 ? (
        <p style={{ color: "var(--g600)" }}>Aún no hay un menú publicado. Vuelve pronto.</p>
      ) : (
        <PackGrid
          items={menu.items.map((it) => ({
            menuItemId: it.id,
            name: it.dish.name,
            description: it.dish.description,
            imageUrl: it.dish.imageUrl,
            available: it.capacity - it.sold,
            allergens: it.dish.allergens.map((a) => a.name),
          }))}
        />
      )}
    </main>
  );
}
