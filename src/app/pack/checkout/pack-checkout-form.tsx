"use client";

import { useActionState } from "react";
import Link from "next/link";
import { usePackSelection, PACK_SIZE } from "@/components/pack-selection";
import { formatEuros } from "@/lib/format";
import { startPackCheckout, type CheckoutState } from "@/lib/orders";
import { AddressFields } from "@/components/address-fields";

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

export function PackCheckoutForm({
  addresses,
  deliveryDate,
  cancelled,
  planName,
  planPriceCents,
  planAvailable,
}: {
  addresses: AddressOption[];
  deliveryDate: string;
  cancelled: boolean;
  planName: string;
  planPriceCents: number;
  planAvailable: boolean;
}) {
  const { items } = usePackSelection();
  const [state, formAction, pending] = useActionState(startPackCheckout, initialState);

  if (!planAvailable || items.length !== PACK_SIZE) {
    return (
      <div style={{ maxWidth: 560, margin: "0 auto", padding: "60px 24px", textAlign: "center" }}>
        <p style={{ color: "var(--g600)", marginBottom: 16 }}>
          {!planAvailable ? "El pack semanal no está disponible ahora mismo." : "Aún no has elegido tus 5 platos."}
        </p>
        <Link href="/pack" style={{ textDecoration: "underline", color: "var(--ink)" }}>
          Ir a elegir platos
        </Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 560, margin: "0 auto", padding: "36px 24px 90px" }}>
      <Link href="/pack" style={{ fontSize: 13.5, color: "var(--g600)", textDecoration: "none" }}>
        ← Volver a elegir platos
      </Link>
      <h1 style={{ fontSize: 32, margin: "12px 0 24px" }}>Checkout del pack</h1>

      {cancelled && (
        <p style={banner}>Pago cancelado. Puedes intentarlo de nuevo cuando quieras.</p>
      )}

      <form action={formAction}>
        <input type="hidden" name="menuItemIds" value={JSON.stringify(items.map((i) => i.menuItemId))} />

        <section style={{ marginBottom: 28 }}>
          <h2 style={sectionTitle}>{planName}</h2>
          <div style={{ border: "1px solid var(--g100)", borderRadius: 12, overflow: "hidden" }}>
            {items.map((it, i) => (
              <div
                key={it.menuItemId}
                style={{ padding: "12px 16px", borderTop: i === 0 ? "none" : "1px solid var(--g100)", fontSize: 14.5 }}
              >
                {it.name}
              </div>
            ))}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 14 }}>
            <span style={{ fontSize: 15, color: "var(--g600)" }}>Total</span>
            <span style={{ fontFamily: "var(--font-display)", fontSize: 22 }}>{formatEuros(planPriceCents)}</span>
          </div>
          <p style={{ fontSize: 13, color: "var(--g600)", marginTop: 8 }}>
            Entrega prevista: {formatDeliveryDate(deliveryDate)}.
          </p>
        </section>

        <AddressFields addresses={addresses} />

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
