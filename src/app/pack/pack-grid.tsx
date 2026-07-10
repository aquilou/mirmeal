"use client";

import { usePackSelection } from "@/components/pack-selection";

type Item = {
  menuItemId: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  available: number;
  allergens: string[];
};

export function PackGrid({ items }: { items: Item[] }) {
  const { items: selected, toggle, isFull } = usePackSelection();
  const selectedIds = new Set(selected.map((s) => s.menuItemId));

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))",
        gap: 16,
      }}
    >
      {items.map((it) => {
        const isSelected = selectedIds.has(it.menuItemId);
        const disabled = it.available <= 0 || (isFull && !isSelected);

        return (
          <button
            key={it.menuItemId}
            type="button"
            onClick={() => toggle({ menuItemId: it.menuItemId, name: it.name, imageUrl: it.imageUrl })}
            disabled={disabled}
            style={{
              textAlign: "left",
              border: isSelected ? "2px solid var(--ink)" : "1px solid var(--g100)",
              borderRadius: 14,
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              background: "none",
              padding: 0,
              cursor: disabled ? "default" : "pointer",
              opacity: disabled && !isSelected ? 0.5 : 1,
              fontFamily: "inherit",
            }}
          >
            <div
              style={{
                aspectRatio: "4/3",
                background: "var(--surface)",
                backgroundImage: it.imageUrl ? `url(${it.imageUrl})` : undefined,
                backgroundSize: "cover",
                backgroundPosition: "center",
                position: "relative",
              }}
            >
              <span
                style={{
                  position: "absolute",
                  top: 10,
                  right: 10,
                  width: 26,
                  height: 26,
                  borderRadius: "50%",
                  background: isSelected ? "var(--ink)" : "rgba(255,255,255,.9)",
                  border: "1px solid var(--g200)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 14,
                  color: isSelected ? "var(--paper)" : "var(--g600)",
                }}
              >
                {isSelected ? "✓" : ""}
              </span>
            </div>
            <div style={{ padding: 14, display: "flex", flexDirection: "column", flex: 1 }}>
              <h3 style={{ fontSize: 17, marginBottom: 4 }}>{it.name}</h3>
              {it.description && (
                <p style={{ fontSize: 13, color: "var(--g600)", marginBottom: 8 }}>{it.description}</p>
              )}
              {it.allergens.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: "auto" }}>
                  {it.allergens.map((a) => (
                    <span
                      key={a}
                      style={{ fontSize: 10.5, color: "#8a5f13", background: "#F7EFDD", border: "0.5px solid #E4CE9B", padding: "2px 8px", borderRadius: 999 }}
                    >
                      {a}
                    </span>
                  ))}
                </div>
              )}
              {it.available <= 0 && (
                <p style={{ fontSize: 12.5, color: "var(--g400)", marginTop: 8 }}>Agotado</p>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}
