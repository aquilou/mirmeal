"use client";

import { useState } from "react";
import { saveWeekItems } from "@/lib/menus";
import { formatEuros } from "@/lib/format";

type Row = {
  id: string;
  name: string;
  priceCents: number;
  imageUrl: string | null;
  inMenu: boolean;
  capacity: number;
  sold: number;
  priceCentsOverride: number | null;
};

export function WeekForm({ menuId, rows }: { menuId: string; rows: Row[] }) {
  const [checked, setChecked] = useState<Record<string, boolean>>(
    Object.fromEntries(rows.map((r) => [r.id, r.inMenu]))
  );

  function toggle(id: string) {
    setChecked((c) => ({ ...c, [id]: !c[id] }));
  }

  return (
    <form action={saveWeekItems}>
      <input type="hidden" name="menuId" value={menuId} />

      <div style={{ border: "1px solid var(--g100)", borderRadius: 12, overflow: "hidden" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 120px 140px",
            gap: 12,
            padding: "10px 16px",
            fontSize: 12,
            color: "var(--g600)",
            background: "var(--surface)",
            borderBottom: "1px solid var(--g100)",
          }}
        >
          <span>Plato</span>
          <span>Cupo</span>
          <span>Precio especial</span>
        </div>

        {rows.map((r) => {
          const on = checked[r.id];
          return (
            <div
              key={r.id}
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 120px 140px",
                gap: 12,
                alignItems: "center",
                padding: "12px 16px",
                borderTop: "1px solid var(--g100)",
                opacity: on ? 1 : 0.55,
              }}
            >
              <label style={{ display: "flex", alignItems: "center", gap: 11, cursor: "pointer" }}>
                <input
                  type="checkbox"
                  name="selected"
                  value={r.id}
                  checked={on}
                  onChange={() => toggle(r.id)}
                />
                <span
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 7,
                    flex: "none",
                    background: "var(--surface)",
                    backgroundImage: r.imageUrl ? `url(${r.imageUrl})` : undefined,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    border: "1px solid var(--g100)",
                  }}
                />
                <span>
                  <span style={{ fontSize: 14.5, fontWeight: 500 }}>{r.name}</span>
                  <span style={{ display: "block", fontSize: 12, color: "var(--g600)" }}>
                    Base {formatEuros(r.priceCents)}
                    {r.inMenu && r.capacity > 0 && ` · vendidos ${r.sold}/${r.capacity}`}
                  </span>
                </span>
              </label>

              <input
                name={`capacity_${r.id}`}
                defaultValue={r.capacity || ""}
                disabled={!on}
                inputMode="numeric"
                placeholder="0"
                style={cell}
              />

              <input
                name={`price_${r.id}`}
                defaultValue={
                  r.priceCentsOverride != null
                    ? (r.priceCentsOverride / 100).toFixed(2).replace(".", ",")
                    : ""
                }
                disabled={!on}
                inputMode="decimal"
                placeholder={(r.priceCents / 100).toFixed(2).replace(".", ",")}
                style={cell}
              />
            </div>
          );
        })}
      </div>

      <button type="submit" style={saveBtn}>
        Guardar menú de la semana
      </button>
    </form>
  );
}

const cell: React.CSSProperties = {
  height: 38,
  padding: "0 11px",
  fontSize: 14,
  border: "1px solid var(--g200)",
  borderRadius: 7,
  fontFamily: "var(--font-ui)",
  width: "100%",
};
const saveBtn: React.CSSProperties = {
  marginTop: 22,
  height: 44,
  padding: "0 22px",
  background: "var(--ink)",
  color: "var(--paper)",
  border: "none",
  borderRadius: 8,
  fontSize: 15,
  fontWeight: 500,
  cursor: "pointer",
  fontFamily: "inherit",
};
