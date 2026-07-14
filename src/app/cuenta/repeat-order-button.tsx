"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/cart";

export function RepeatOrderButton({ orderId }: { orderId: string }) {
  const { add } = useCart();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function onClick() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/orders/${orderId}/repeat`, { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "No se pudo repetir el pedido.");

      const items: { menuItemId: string; name: string; priceCents: number; imageUrl: string | null; quantity: number }[] =
        data.items ?? [];

      if (items.length === 0) {
        setError("Ninguno de esos platos está disponible esta semana.");
        setLoading(false);
        return;
      }

      for (const item of items) {
        for (let i = 0; i < item.quantity; i++) {
          add(
            { menuItemId: item.menuItemId, name: item.name, priceCents: item.priceCents, imageUrl: item.imageUrl },
            item.quantity
          );
        }
      }

      router.push("/carrito");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Algo salió mal.");
      setLoading(false);
    }
  }

  return (
    <div>
      <button onClick={onClick} disabled={loading} style={styles.button}>
        {loading ? "Preparando…" : "Repetir pedido"}
      </button>
      {error && <p style={styles.error}>{error}</p>}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  button: {
    height: 38,
    padding: "0 16px",
    borderRadius: "var(--radius)",
    border: "1px solid var(--g200)",
    background: "transparent",
    color: "var(--ink)",
    fontSize: 13.5,
    fontWeight: 500,
    cursor: "pointer",
    fontFamily: "inherit",
  },
  error: { color: "var(--error)", fontSize: 12.5, marginTop: 6 },
};
