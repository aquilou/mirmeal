"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/admin", label: "Panel" },
  { href: "/admin/platos", label: "Platos" },
];

const upcoming = ["Menú semanal", "Pedidos", "Clientes", "Comunicaciones"];

export function AdminNav() {
  const path = usePathname();

  return (
    <nav style={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {items.map((it) => {
        const active = it.href === "/admin" ? path === "/admin" : path.startsWith(it.href);
        return (
          <Link
            key={it.href}
            href={it.href}
            style={{
              padding: "9px 12px",
              borderRadius: 8,
              fontSize: 14,
              textDecoration: "none",
              color: active ? "var(--ink)" : "var(--g600)",
              background: active ? "var(--g100)" : "transparent",
              fontWeight: active ? 500 : 400,
            }}
          >
            {it.label}
          </Link>
        );
      })}
      <div style={{ height: 1, background: "var(--g100)", margin: "10px 6px" }} />
      {upcoming.map((label) => (
        <span
          key={label}
          style={{ padding: "9px 12px", fontSize: 14, color: "var(--g400)" }}
          title="Próximamente"
        >
          {label}
        </span>
      ))}
    </nav>
  );
}
