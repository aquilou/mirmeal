"use client";

import { useEffect, useState } from "react";

/** Aviso flotante que aparece cuando `trigger` cambia (p.ej. un timestamp) y se oculta solo. */
export function Toast({ message, trigger }: { message: string; trigger: unknown }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (trigger === undefined || trigger === null) return;
    setVisible(true);
    const t = setTimeout(() => setVisible(false), 2500);
    return () => clearTimeout(t);
  }, [trigger]);

  if (!visible) return null;

  return (
    <div
      role="status"
      style={{
        position: "fixed",
        left: "50%",
        bottom: 24,
        transform: "translateX(-50%)",
        zIndex: 100,
        background: "var(--ink)",
        color: "var(--paper)",
        padding: "10px 18px",
        borderRadius: 999,
        fontSize: 13.5,
        boxShadow: "0 6px 24px rgba(0,0,0,.18)",
      }}
    >
      {message}
    </div>
  );
}
