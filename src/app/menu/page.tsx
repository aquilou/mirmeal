import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { weekLabel } from "@/lib/week";
import { formatEuros } from "@/lib/format";
import { AddButton } from "@/components/cart";
import { getCurrentWeeklyMenu } from "@/lib/menu-query";

export const dynamic = "force-dynamic";

export default async function MenuPage() {
  const [menu, packPlan] = await Promise.all([
    getCurrentWeeklyMenu(),
    prisma.pricingPlan.findUnique({ where: { type: "PACK_5" } }),
  ]);

  return (
    <div>
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "18px 24px",
          borderBottom: "1px solid var(--g100)",
        }}
      >
        <Link href="/menu" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <svg viewBox="0 0 200 210" width="26" fill="none" stroke="var(--ink)" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M124.6 50.3 A72 72 0 1 1 75.4 50.3" />
            <polyline points="75,50 92,45 100,20 108,45 125,50" />
            <line x1="88" y1="76" x2="88" y2="104" /><line x1="100" y1="76" x2="100" y2="104" /><line x1="112" y1="76" x2="112" y2="104" />
            <path d="M88 104 L100 114 L112 104" /><line x1="100" y1="114" x2="100" y2="154" />
          </svg>
          <span style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 22 }}>MIR Meal</span>
        </Link>
        <Link href="/cuenta" style={{ fontSize: 14, color: "var(--g600)", textDecoration: "none" }}>
          Mi cuenta
        </Link>
      </header>

      <main style={{ maxWidth: 1080, margin: "0 auto", padding: "40px 24px 90px" }}>
        <h1 style={{ fontSize: "clamp(30px,4vw,44px)", marginBottom: 6 }}>El menú de esta semana</h1>
        {menu ? (
          <p style={{ color: "var(--g600)", marginBottom: 20 }}>{weekLabel(menu.weekStart)}</p>
        ) : null}

        {packPlan?.active && (
          <Link
            href="/pack"
            style={{
              display: "block",
              background: "var(--surface)",
              border: "1px solid var(--g100)",
              borderRadius: 12,
              padding: "14px 18px",
              marginBottom: 28,
              textDecoration: "none",
              color: "var(--ink)",
              fontSize: 14.5,
            }}
          >
            ¿Prefieres ahorrar? Elige el <strong>pack semanal de 5 platos</strong> por {formatEuros(packPlan.priceCents)} →
          </Link>
        )}

        {!menu || menu.items.length === 0 ? (
          <p style={{ color: "var(--g600)" }}>
            Aún no hay un menú publicado. Vuelve pronto: publicamos la carta cada semana.
          </p>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 20 }}>
            {menu.items.map((it) => {
              const price = it.priceCentsOverride ?? it.dish.priceCents;
              const available = it.capacity - it.sold;
              return (
                <article
                  key={it.id}
                  style={{ border: "1px solid var(--g100)", borderRadius: 14, overflow: "hidden", display: "flex", flexDirection: "column" }}
                >
                  <div
                    style={{
                      aspectRatio: "4/3",
                      background: "var(--surface)",
                      backgroundImage: it.dish.imageUrl ? `url(${it.dish.imageUrl})` : undefined,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                  />
                  <div style={{ padding: 18, display: "flex", flexDirection: "column", flex: 1 }}>
                    <h3 style={{ fontSize: 20, marginBottom: 4 }}>{it.dish.name}</h3>
                    {it.dish.description && (
                      <p style={{ fontSize: 13.5, color: "var(--g600)", marginBottom: 10 }}>{it.dish.description}</p>
                    )}
                    <p style={{ fontSize: 12.5, color: "var(--g600)", marginBottom: 10 }}>
                      {it.dish.kcal ? `${it.dish.kcal} kcal` : ""}
                      {it.dish.proteinG ? ` · ${it.dish.proteinG} g proteína` : ""}
                    </p>
                    {it.dish.allergens.length > 0 && (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
                        {it.dish.allergens.map((a) => (
                          <span key={a.id} style={{ fontSize: 11, color: "#8a5f13", background: "#F7EFDD", border: "0.5px solid #E4CE9B", padding: "3px 9px", borderRadius: 999 }}>
                            {a.name}
                          </span>
                        ))}
                      </div>
                    )}
                    <div style={{ marginTop: "auto", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                      <span style={{ fontFamily: "var(--font-display)", fontSize: 22 }}>{formatEuros(price)}</span>
                      <AddButton
                        item={{ menuItemId: it.id, name: it.dish.name, priceCents: price, imageUrl: it.dish.imageUrl }}
                        max={available}
                      />
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
