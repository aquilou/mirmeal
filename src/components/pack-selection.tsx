"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export type PackItem = {
  menuItemId: string;
  name: string;
  imageUrl: string | null;
};

export const PACK_SIZE = 5;

type PackCtx = {
  items: PackItem[];
  toggle: (item: PackItem) => void;
  clear: () => void;
  isFull: boolean;
};

const Ctx = createContext<PackCtx | null>(null);
const KEY = "mirmeal-pack-selection";

export function PackSelectionProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<PackItem[]>([]);
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

  const toggle = useCallback((item: PackItem) => {
    setItems((prev) => {
      const exists = prev.some((p) => p.menuItemId === item.menuItemId);
      if (exists) return prev.filter((p) => p.menuItemId !== item.menuItemId);
      if (prev.length >= PACK_SIZE) return prev;
      return [...prev, item];
    });
  }, []);

  const clear = useCallback(() => setItems([]), []);

  return (
    <Ctx.Provider value={{ items, toggle, clear, isFull: items.length >= PACK_SIZE }}>
      {children}
    </Ctx.Provider>
  );
}

export function usePackSelection() {
  const c = useContext(Ctx);
  if (!c) throw new Error("usePackSelection debe usarse dentro de PackSelectionProvider");
  return c;
}

export function PackBar() {
  const { items } = usePackSelection();
  const path = usePathname();

  const hidden = path.startsWith("/admin") || path.startsWith("/login") || path.startsWith("/register") || !path.startsWith("/pack");
  if (hidden || items.length === 0) return null;

  const full = items.length >= PACK_SIZE;

  return (
    <Link
      href={full ? "/pack/checkout" : "#"}
      aria-disabled={!full}
      style={{
        position: "fixed",
        left: "50%",
        transform: "translateX(-50%)",
        bottom: 20,
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        gap: 14,
        background: full ? "var(--ink)" : "var(--g400)",
        color: "var(--paper)",
        padding: "12px 22px",
        borderRadius: 999,
        textDecoration: "none",
        fontSize: 15,
        fontWeight: 500,
        boxShadow: "0 6px 24px rgba(0,0,0,.18)",
        pointerEvents: full ? "auto" : "none",
        maxWidth: "calc(100vw - 32px)",
      }}
    >
      <span>{items.length}/{PACK_SIZE} elegidos</span>
      {full && (
        <>
          <span style={{ opacity: 0.6 }}>·</span>
          <span>Continuar</span>
        </>
      )}
    </Link>
  );
}

export function ClearPackSelectionOnMount() {
  const { clear } = usePackSelection();
  useEffect(() => {
    clear();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}
