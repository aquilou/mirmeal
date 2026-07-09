"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { useCart } from "@/components/cart";
import { formatEuros } from "@/lib/format";
import { startCheckout, type CheckoutState } from "@/lib/orders";

type AddressOption = {
  id: string;
  label: string | null;
  street: string;
  city: string;
  postalCode: string;
  isDefault: boolean;
};

const initialState: CheckoutState = {};

function formatDeliveryDate(iso: string): string {
  const date = new Date(iso);
  return new Intl.DateTimeFormat("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "UTC",
  }).format(date);
}

export function CheckoutForm({
  addresses,
  deliveryDate,
  cancelled,
}: {
  addresses: AddressOption[];
  deliveryDate: string;
  cancelled: boolean;
}) {
  const { items, subtotalCents } = useCart();
  const [addressId, setAddressId] = useState(addresses[0]?.id ?? "new");
  const [state, formAction, pending] = useActionState(startCheckout, initialState);

  if (items.length === 0) {
    return (
      <div style={{ maxWidth: 560, margin: "0 auto", padding: "60px 24px", textAlign: "center" }}>
        <p style={{ color: "var(--g600)", marginBottom: 16 }}>Tu pedido está vacío.</p>
        <Link href="/menu" style={{ textDecoration: "underline", color: "var(--ink)" }}>
          Ver el menú
        </Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 560, margin: "0 auto", padding: "36px 24px 90px" }}>
      <Link href="/carrito" style={{ fontSize: 13.5, color: "var(--g600)", textDecoration: "none" }}>
        ← Volver al pedido
      </Link>
      <h1 style={{ fontSize: 32, margin: "12px 0 24px" }}>Checkout</h1>

      {cancelled && (
        <p style={banner}>Pago cancelado. Puedes intentarlo de nuevo cuando quieras.</p>
      )}

      <form action={formAction}>
        <input type="hidden" name="cartItems" value={JSON.stringify(items.map(({ menuItemId, quantity }) => ({ menuItemId, quantity })))} />

        <section style={{ marginBottom: 28 }}>
          <h2 style={sectionTitle}>Tu pedido</h2>
          <div style={{ border: "1px solid var(--g100)", borderRadius: 12, overflow: "hidden" }}>
            {items.map((it, i) => (
              <div
                key={it.menuItemId}
                style={{ display: "flex", justifyContent: "space-between", padding: "12px 16px", borderTop: i === 0 ? "none" : "1px solid var(--g100)", fontSize: 14.5 }}
              >
                <span>{it.quantity}× {it.name}</span>
                <span>{formatEuros(it.priceCents * it.quantity)}</span>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 14 }}>
            <span style={{ fontSize: 15, color: "var(--g600)" }}>Total</span>
            <span style={{ fontFamily: "var(--font-display)", fontSize: 22 }}>{formatEuros(subtotalCents)}</span>
          </div>
          <p style={{ fontSize: 13, color: "var(--g600)", marginTop: 8 }}>
            Entrega prevista: {formatDeliveryDate(deliveryDate)}.
          </p>
        </section>

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
              <div style={{ display: "flex", gap: 10 }}>
                <input name="city" placeholder="Ciudad" style={{ ...input, flex: 2 }} required />
                <input name="postalCode" placeholder="Código postal" style={{ ...input, flex: 1 }} required />
              </div>
              <textarea name="notes" placeholder="Indicaciones para el repartidor (opcional)" style={{ ...input, height: 70, resize: "vertical" }} />
            </div>
          )}
        </section>

        {state.error && <p style={{ color: "var(--error)", fontSize: 14, marginBottom: 16 }}>{state.error}</p>}

        <button
          type="submit"
          disabled={pending}
          style={{
            width: "100%",
            background: "var(--ink)",
            color: "var(--paper)",
            padding: "14px",
            borderRadius: 10,
            border: "none",
            fontSize: 16,
            fontWeight: 500,
            cursor: pending ? "default" : "pointer",
            opacity: pending ? 0.7 : 1,
          }}
        >
          {pending ? "Redirigiendo a Stripe…" : "Pagar con Stripe"}
        </button>
      </form>
    </div>
  );
}

const sectionTitle: React.CSSProperties = { fontSize: 16, fontWeight: 500, marginBottom: 12 };

const banner: React.CSSProperties = {
  background: "#FCEFE3",
  border: "1px solid #E9CBA6",
  color: "#8a5f13",
  padding: "10px 14px",
  borderRadius: 10,
  fontSize: 13.5,
  marginBottom: 20,
};

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
};
