import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatEuros } from "@/lib/format";
import { deleteDish, toggleDishActive } from "@/lib/dishes";

export const dynamic = "force-dynamic";

export default async function PlatosPage() {
  const dishes = await prisma.dish.findMany({
    orderBy: { createdAt: "desc" },
    include: { allergens: true },
  });

  return (
    <div style={{ maxWidth: 920 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 22 }}>
        <h1 style={{ fontSize: 30 }}>Platos</h1>
        <Link
          href="/admin/platos/nuevo"
          style={{
            background: "var(--ink)",
            color: "var(--paper)",
            padding: "10px 18px",
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 500,
            textDecoration: "none",
          }}
        >
          Nuevo plato
        </Link>
      </div>

      {dishes.length === 0 ? (
        <p style={{ color: "var(--g600)" }}>
          Todavía no hay platos. Crea el primero con «Nuevo plato».
        </p>
      ) : (
        <div style={{ border: "1px solid var(--g100)", borderRadius: 12, overflow: "hidden" }}>
          {dishes.map((d, i) => (
            <div
              key={d.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                padding: "12px 16px",
                borderTop: i === 0 ? "none" : "1px solid var(--g100)",
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 8,
                  flex: "none",
                  background: "var(--surface)",
                  backgroundImage: d.imageUrl ? `url(${d.imageUrl})` : undefined,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  border: "1px solid var(--g100)",
                }}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 15, fontWeight: 500 }}>{d.name}</div>
                <div style={{ fontSize: 12.5, color: "var(--g600)" }}>
                  {formatEuros(d.priceCents)}
                  {d.allergens.length > 0 && ` · ${d.allergens.length} alérgeno(s)`}
                  {d.kcal ? ` · ${d.kcal} kcal` : ""}
                </div>
              </div>

              {!d.active && (
                <span style={{ fontSize: 11.5, color: "var(--g600)", background: "var(--g100)", padding: "3px 9px", borderRadius: 999 }}>
                  Inactivo
                </span>
              )}

              <Link href={`/admin/platos/${d.id}`} style={{ fontSize: 13.5, color: "var(--ink)", textDecoration: "underline" }}>
                Editar
              </Link>

              <form action={toggleDishActive}>
                <input type="hidden" name="id" value={d.id} />
                <button style={ghostBtn}>{d.active ? "Desactivar" : "Activar"}</button>
              </form>

              <form action={deleteDish}>
                <input type="hidden" name="id" value={d.id} />
                <button style={{ ...ghostBtn, color: "var(--error)", borderColor: "var(--error)" }}>
                  Borrar
                </button>
              </form>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const ghostBtn: React.CSSProperties = {
  fontSize: 12.5,
  padding: "5px 11px",
  borderRadius: 7,
  border: "1px solid var(--g200)",
  background: "transparent",
  color: "var(--g600)",
  cursor: "pointer",
  fontFamily: "inherit",
};
