"use client";

import Link from "next/link";
import { useCart } from "@/components/cart";
import { formatEuros } from "@/lib/format";

export default function CarritoPage() {
  const { items, setQty, remove, subtotalCents } = useCart();

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "36px 24px 90px" }}>
      <Link href="/menu" style={{ fontSize: 13.5, color: "var(--g600)", textDecoration: "none" }}>
        ← Seguir eligiendo
      </Link>
      <h1 style={{ fontSize: 32, margin: "12px 0 24px" }}>Tu pedido</h1>

      {items.length === 0 ? (
        <p style={{ color: "var(--g600)" }}>
          Tu pedido está vacío. <Link href="/menu" style={{ textDecoration: "underline", color: "var(--ink)" }}>Ver el menú</Link>.
        </p>
      ) : (
        <>
          <div style={{ border: "1px solid var(--g100)", borderRadius: 12, overflow: "hidden" }}>
            {items.map((it, i) => (
              <div
                key={it.menuItemId}
                style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", borderTop: i === 0 ? "none" : "1px solid var(--g100)" }}
              >
                <span
                  style={{
                    width: 46, height: 46, borderRadius: 8, flex: "none",
                    background: "var(--surface)",
                    backgroundImage: it.imageUrl ? `url(${it.imageUrl})` : undefined,
                    backgroundSize: "cover", backgroundPosition: "center", border: "1px solid var(--g100)",
                  }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 500 }}>{it.name}</div>
                  <div style={{ fontSize: 13, color: "var(--g600)" }}>{formatEuros(it.priceCents)}</div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <button onClick={() => setQty(it.menuItemId, it.quantity - 1)} style={qtyBtn} aria-label="Quitar uno">–</button>
                  <span style={{ minWidth: 20, textAlign: "center", fontSize: 15 }}>{it.quantity}</span>
                  <button onClick={() => setQty(it.menuItemId, it.quantity + 1)} style={qtyBtn} aria-label="Añadir uno">+</button>
                </div>

                <span style={{ fontFamily: "var(--font-display)", fontSize: 16, minWidth: 66, textAlign: "right" }}>
                  {formatEuros(it.priceCents * it.quantity)}
                </span>

                <button onClick={() => remove(it.menuItemId)} style={{ background: "none", border: "none", color: "var(--g400)", cursor: "pointer", fontSize: 18 }} aria-label="Eliminar">×</button>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 22 }}>
            <span style={{ fontSize: 15, color: "var(--g600)" }}>Subtotal</span>
            <span style={{ fontFamily: "var(--font-display)", fontSize: 26 }}>{formatEuros(subtotalCents)}</span>
          </div>

          <Link
            href="/checkout"
            style={{
              display: "block", textAlign: "center", marginTop: 20,
              background: "var(--ink)", color: "var(--paper)", padding: "14px", borderRadius: 10,
              fontSize: 16, fontWeight: 500, textDecoration: "none",
            }}
          >
            Continuar al pago
          </Link>
          <p style={{ fontSize: 12.5, color: "var(--g400)", textAlign: "center", marginTop: 10 }}>
            La fecha de entrega se calcula en el siguiente paso.
          </p>
        </>
      )}
    </div>
  );
}

const qtyBtn: React.CSSProperties = {
  width: 30, height: 30, borderRadius: 7, border: "1px solid var(--g200)",
  background: "transparent", cursor: "pointer", fontSize: 16, lineHeight: 1, fontFamily: "inherit",
};
