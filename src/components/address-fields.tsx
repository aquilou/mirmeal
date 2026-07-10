"use client";

import { useState } from "react";

type AddressOption = {
  id: string;
  label: string | null;
  street: string;
  city: string;
  postalCode: string;
  isDefault: boolean;
};

export function AddressFields({ addresses }: { addresses: AddressOption[] }) {
  const [addressId, setAddressId] = useState(addresses[0]?.id ?? "new");

  return (
    <section style={{ marginBottom: 28 }}>
      <h2 style={sectionTitle}>Dirección de entrega</h2>

      {addresses.map((a) => (
        <label key={a.id} style={addressOption}>
          <input
            type="radio"
            name="addressId"
            value={a.id}
            checked={addressId === a.id}
            onChange={() => setAddressId(a.id)}
          />
          <span>
            {a.label ? <strong>{a.label}</strong> : null} {a.street}, {a.city} ({a.postalCode})
          </span>
        </label>
      ))}

      <label style={addressOption}>
        <input
          type="radio"
          name="addressId"
          value="new"
          checked={addressId === "new"}
          onChange={() => setAddressId("new")}
        />
        <span>Usar otra dirección</span>
      </label>

      {addressId === "new" && (
        <div style={{ display: "grid", gap: 10, marginTop: 12 }}>
          <input name="label" placeholder="Nombre (opcional, ej. Casa)" style={input} />
          <input name="street" placeholder="Calle y número" style={input} required />
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            <input name="city" placeholder="Ciudad" style={{ ...input, flex: "2 1 160px" }} required />
            <input name="postalCode" placeholder="Código postal" style={{ ...input, flex: "1 1 120px" }} required />
          </div>
          <textarea name="notes" placeholder="Indicaciones para el repartidor (opcional)" style={{ ...input, height: 70, resize: "vertical" }} />
        </div>
      )}
    </section>
  );
}

const sectionTitle: React.CSSProperties = { fontSize: 16, fontWeight: 500, marginBottom: 12 };

const addressOption: React.CSSProperties = {
  display: "flex",
  alignItems: "flex-start",
  gap: 10,
  padding: "10px 4px",
  fontSize: 14.5,
  cursor: "pointer",
};

const input: React.CSSProperties = {
  height: 44,
  padding: "0 14px",
  fontSize: 14.5,
  border: "1px solid var(--g200)",
  borderRadius: 8,
  fontFamily: "inherit",
  width: "100%",
  boxSizing: "border-box",
};
