"use client";

import { useActionState, useState } from "react";
import { formatEuros } from "@/lib/format";
import { createManualOrder, type ManualOrderState } from "@/lib/order-admin";

const initialState: ManualOrderState = {};

type Address = { id: string; label: string | null; street: string; city: string; postalCode: string };
type Customer = { id: string; name: string | null; email: string; addresses: Address[] };
type MenuItemOption = { menuItemId: string; name: string; priceCents: number; available: number };

export function ManualOrderForm({
  customers,
  defaultCustomerId,
  defaultDeliveryDate,
  menuItems,
}: {
  customers: Customer[];
  defaultCustomerId: string;
  defaultDeliveryDate: string;
  menuItems: MenuItemOption[];
}) {
  const [state, formAction, pending] = useActionState(createManualOrder, initialState);
  const [customerId, setCustomerId] = useState(defaultCustomerId || customers[0]?.id || "");
  const [addressId, setAddressId] = useState("new");
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  const customer = customers.find((c) => c.id === customerId);
  const cartItems = Object.entries(quantities)
    .filter(([, q]) => q > 0)
    .map(([menuItemId, quantity]) => ({ menuItemId, quantity }));

  return (
    <form action={formAction}>
      <input type="hidden" name="customerId" value={customerId} />
      <input type="hidden" name="cartItems" value={JSON.stringify(cartItems)} />

      <section style={{ marginBottom: 24 }}>
        <h2 style={sectionTitle}>Cliente</h2>
        <select value={customerId} onChange={(e) => { setCustomerId(e.target.value); setAddressId("new"); }} style={select}>
          {customers.map((c) => (
            <option key={c.id} value={c.id}>{c.name || c.email}</option>
          ))}
        </select>
      </section>

      <section style={{ marginBottom: 24 }}>
        <h2 style={sectionTitle}>Dirección de entrega</h2>
        {customer?.addresses.map((a) => (
          <label key={a.id} style={addressOption}>
            <input type="radio" name="addressId" value={a.id} checked={addressId === a.id} onChange={() => setAddressId(a.id)} />
            <span>{a.label ? <strong>{a.label}: </strong> : null}{a.street}, {a.city} ({a.postalCode})</span>
          </label>
        ))}
        <label style={addressOption}>
          <input type="radio" name="addressId" value="new" checked={addressId === "new"} onChange={() => setAddressId("new")} />
          <span>Dirección nueva</span>
        </label>
        {addressId === "new" && (
          <div style={{ display: "grid", gap: 10, marginTop: 12 }}>
            <input name="label" placeholder="Nombre (opcional)" style={input} />
            <input name="street" placeholder="Calle y número" style={input} required />
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              <input name="city" placeholder="Ciudad" style={{ ...input, flex: "2 1 160px" }} required />
              <input name="postalCode" placeholder="Código postal" style={{ ...input, flex: "1 1 120px" }} required />
            </div>
            <textarea name="notes" placeholder="Indicaciones (opcional)" style={{ ...input, height: 60 }} />
          </div>
        )}
      </section>

      <section style={{ marginBottom: 24 }}>
        <h2 style={sectionTitle}>Fecha de entrega</h2>
        <input type="date" name="deliveryDate" defaultValue={defaultDeliveryDate} style={input} required />
      </section>

      <section style={{ marginBottom: 24 }}>
        <h2 style={sectionTitle}>Platos de esta semana</h2>
        <div style={{ border: "1px solid var(--g100)", borderRadius: 12, overflow: "hidden" }}>
          {menuItems.map((it, i) => (
            <div
              key={it.menuItemId}
              style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 16px", borderTop: i === 0 ? "none" : "1px solid var(--g100)" }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14.5 }}>{it.name}</div>
                <div style={{ fontSize: 12, color: "var(--g600)" }}>
                  {formatEuros(it.priceCents)} · disponibles {it.available}
                </div>
              </div>
              <input
                type="number"
                min={0}
                max={it.available}
                disabled={it.available <= 0}
                value={quantities[it.menuItemId] ?? 0}
                onChange={(e) => {
                  const v = Math.max(0, Math.min(it.available, parseInt(e.target.value, 10) || 0));
                  setQuantities((q) => ({ ...q, [it.menuItemId]: v }));
                }}
                style={{ ...input, width: 70 }}
              />
            </div>
          ))}
        </div>
      </section>

      {state.error && <p style={{ color: "var(--error)", fontSize: 14, marginBottom: 16 }}>{state.error}</p>}

      <button type="submit" disabled={pending || cartItems.length === 0} style={{ ...saveBtn, opacity: pending || cartItems.length === 0 ? 0.6 : 1 }}>
        {pending ? "Creando…" : "Crear pedido"}
      </button>
    </form>
  );
}

const sectionTitle: React.CSSProperties = { fontSize: 16, fontWeight: 500, marginBottom: 12 };
const select: React.CSSProperties = {
  height: 42, padding: "0 12px", fontSize: 14.5, border: "1px solid var(--g200)", borderRadius: 8, fontFamily: "inherit", width: "100%",
};
const input: React.CSSProperties = {
  height: 42, padding: "0 12px", fontSize: 14.5, border: "1px solid var(--g200)", borderRadius: 8, fontFamily: "inherit", width: "100%", boxSizing: "border-box",
};
const addressOption: React.CSSProperties = { display: "flex", alignItems: "flex-start", gap: 10, padding: "8px 4px", fontSize: 14, cursor: "pointer" };
const saveBtn: React.CSSProperties = {
  height: 44, padding: "0 22px", background: "var(--ink)", color: "var(--paper)", border: "none", borderRadius: 8, fontSize: 15, fontWeight: 500, cursor: "pointer", fontFamily: "inherit",
};
