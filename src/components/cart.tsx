"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { formatEuros } from "@/lib/format";

export type CartItem = {
  menuItemId: string;
  name: string;
  priceCents: number;
  imageUrl: string | null;
  quantity: number;
};

type CartCtx = {
  items: CartItem[];
  add: (i: Omit<CartItem, "quantity">, max?: number) => void;
  setQty: (id: string, q: number) => void;
  remove: (id: string) => void;
  clear: () => void;
  count: number;
  subtotalCents: number;
};

const Ctx = createContext<CartCtx | null>(null);
const KEY = "mirmeal-cart";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {}
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) {
      try {
        localStorage.setItem(KEY, JSON.stringify(items));
      } catch {}
    }
  }, [items, loaded]);

  const add = useCallback((i: Omit<CartItem, "quantity">, max?: number) => {
    setItems((prev) => {
      const existing = prev.find((p) => p.menuItemId === i.menuItemId);
      if (existing) {
        const q = Math.min(existing.quantity + 1, max ?? Infinity);
        return prev.map((p) => (p.menuItemId === i.menuItemId ? { ...p, quantity: q } : p));
      }
      return [...prev, { ...i, quantity: 1 }];
    });
  }, []);

  const setQty = useCallback((id: string, q: number) => {
    setItems((prev) =>
      q <= 0
        ? prev.filter((p) => p.menuItemId !== id)
        : prev.map((p) => (p.menuItemId === id ? { ...p, quantity: q } : p))
    );
  }, []);

  const remove = useCallback((id: string) => {
    setItems((prev) => prev.filter((p) => p.menuItemId !== id));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const count = items.reduce((s, i) => s + i.quantity, 0);
  const subtotalCents = items.reduce((s, i) => s + i.priceCents * i.quantity, 0);

  return (
    <Ctx.Provider value={{ items, add, setQty, remove, clear, count, subtotalCents }}>
      {children}
    </Ctx.Provider>
  );
}

export function useCart() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useCart debe usarse dentro de CartProvider");
  return c;
}

export function AddButton({
  item,
  max,
}: {
  item: Omit<CartItem, "quantity">;
  max: number;
}) {
  const { add } = useCart();
  const disabled = max <= 0;
  return (
    <button
      onClick={() => add(item, max)}
      disabled={disabled}
      style={{
        height: 38,
        padding: "0 16px",
        borderRadius: 8,
        border: "none",
        background: disabled ? "var(--g200)" : "var(--ink)",
        color: "var(--paper)",
        fontSize: 14,
        fontWeight: 500,
        cursor: disabled ? "default" : "pointer",
        fontFamily: "inherit",
      }}
    >
      {disabled ? "Agotado" : "Añadir"}
    </button>
  );
}

export function CartBar() {
  const { count, subtotalCents } = useCart();
  const path = usePathname();

  // Solo en la tienda del cliente, no en el panel ni en auth.
  const hidden =
    path.startsWith("/admin") ||
    path.startsWith("/login") ||
    path.startsWith("/register") ||
    path.startsWith("/carrito");

  if (count === 0 || hidden) return null;

  return (
    <Link
      href="/carrito"
      style={{
        position: "fixed",
        left: "50%",
        transform: "translateX(-50%)",
        bottom: 20,
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        gap: 14,
        background: "var(--ink)",
        color: "var(--paper)",
        padding: "12px 22px",
        borderRadius: 999,
        textDecoration: "none",
        fontSize: 15,
        fontWeight: 500,
        boxShadow: "0 6px 24px rgba(0,0,0,.18)",
      }}
    >
      <span>Ver pedido</span>
      <span style={{ opacity: 0.6 }}>·</span>
      <span>{count} {count === 1 ? "plato" : "platos"}</span>
      <span style={{ opacity: 0.6 }}>·</span>
      <span>{formatEuros(subtotalCents)}</span>
    </Link>
  );
}
