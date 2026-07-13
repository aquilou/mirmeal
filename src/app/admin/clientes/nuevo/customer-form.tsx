"use client";

import { useActionState } from "react";
import { createCustomer, type CustomerState } from "@/lib/customers";

const initialState: CustomerState = {};

export function CustomerForm() {
  const [state, formAction, pending] = useActionState(createCustomer, initialState);

  return (
    <form action={formAction} style={{ display: "grid", gap: 14, border: "1px solid var(--g100)", borderRadius: 12, padding: 20, maxWidth: 420 }}>
      <label style={label}>
        Nombre
        <input name="name" style={input} required />
      </label>
      <label style={label}>
        Correo
        <input name="email" type="email" style={input} required />
      </label>
      <label style={label}>
        Teléfono (opcional)
        <input name="phone" style={input} />
      </label>

      {state.error && <p style={{ color: "var(--error)", fontSize: 13.5 }}>{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        style={{
          background: "var(--ink)",
          color: "var(--paper)",
          padding: "10px 18px",
          borderRadius: 8,
          border: "none",
          fontSize: 14,
          fontWeight: 500,
          cursor: pending ? "default" : "pointer",
          opacity: pending ? 0.7 : 1,
          justifySelf: "start",
        }}
      >
        {pending ? "Creando…" : "Crear cliente"}
      </button>
    </form>
  );
}

const label: React.CSSProperties = { display: "flex", flexDirection: "column", gap: 6, fontSize: 13.5, color: "var(--g600)" };
const input: React.CSSProperties = {
  height: 42,
  padding: "0 12px",
  fontSize: 14.5,
  border: "1px solid var(--g200)",
  borderRadius: 8,
  fontFamily: "inherit",
  color: "var(--ink)",
};
