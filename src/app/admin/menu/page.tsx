import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { createWeek, deleteWeek } from "@/lib/menus";
import { weekLabel, mondayOf, toInputValue } from "@/lib/week";

export const dynamic = "force-dynamic";

export default async function MenuPage() {
  const menus = await prisma.weeklyMenu.findMany({
    orderBy: { weekStart: "desc" },
    include: { _count: { select: { items: true } } },
  });

  // Sugerencia por defecto: el lunes de la próxima semana.
  const nextMonday = mondayOf(new Date());
  nextMonday.setUTCDate(nextMonday.getUTCDate() + 7);

  return (
    <div style={{ maxWidth: 820 }}>
      <h1 style={{ fontSize: 30, marginBottom: 6 }}>Menú semanal</h1>
      <p style={{ color: "var(--g600)", marginBottom: 24 }}>
        Crea la semana y elige qué platos del catálogo entran, con su cupo.
      </p>

      <form
        action={createWeek}
        style={{
          display: "flex",
          alignItems: "flex-end",
          gap: 12,
          border: "1px solid var(--g100)",
          borderRadius: 12,
          padding: 18,
          marginBottom: 26,
        }}
      >
        <div>
          <label style={{ display: "block", fontSize: 13, fontWeight: 500, marginBottom: 6 }}>
            Nueva semana (elige cualquier día; se ajusta al lunes)
          </label>
          <input
            type="date"
            name="weekStart"
            defaultValue={toInputValue(nextMonday)}
            required
            style={{
              height: 44,
              padding: "0 13px",
              fontSize: 15,
              border: "1px solid var(--g200)",
              borderRadius: 8,
              fontFamily: "var(--font-ui)",
            }}
          />
        </div>
        <button
          type="submit"
          style={{
            height: 44,
            padding: "0 20px",
            background: "var(--ink)",
            color: "var(--paper)",
            border: "none",
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 500,
            cursor: "pointer",
          }}
        >
          Crear semana
        </button>
      </form>

      {menus.length === 0 ? (
        <p style={{ color: "var(--g600)" }}>Aún no has creado ninguna semana.</p>
      ) : (
        <div style={{ border: "1px solid var(--g100)", borderRadius: 12, overflow: "hidden" }}>
          {menus.map((m, i) => (
            <div
              key={m.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                padding: "14px 16px",
                borderTop: i === 0 ? "none" : "1px solid var(--g100)",
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 500 }}>{weekLabel(m.weekStart)}</div>
                <div style={{ fontSize: 12.5, color: "var(--g600)" }}>
                  {m._count.items} plato(s)
                </div>
              </div>
              <span
                style={{
                  fontSize: 11.5,
                  padding: "3px 10px",
                  borderRadius: 999,
                  background: m.published ? "#E1F5EE" : "var(--g100)",
                  color: m.published ? "#0F6E56" : "var(--g600)",
                }}
              >
                {m.published ? "Publicado" : "Borrador"}
              </span>
              <Link
                href={`/admin/menu/${m.id}`}
                style={{ fontSize: 13.5, color: "var(--ink)", textDecoration: "underline" }}
              >
                Editar
              </Link>
              <form action={deleteWeek}>
                <input type="hidden" name="id" value={m.id} />
                <button
                  style={{
                    fontSize: 12.5,
                    padding: "5px 11px",
                    borderRadius: 7,
                    border: "1px solid var(--error)",
                    background: "transparent",
                    color: "var(--error)",
                    cursor: "pointer",
                    fontFamily: "inherit",
                  }}
                >
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
