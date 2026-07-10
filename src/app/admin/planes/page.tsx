import { prisma } from "@/lib/prisma";
import { formatEuros } from "@/lib/format";
import { savePlan } from "@/lib/plans";

export const dynamic = "force-dynamic";

export default async function PlanesPage() {
  const plan = await prisma.pricingPlan.findUnique({ where: { type: "PACK_5" } });

  return (
    <div style={{ maxWidth: 480 }}>
      <h1 style={{ fontSize: 30, marginBottom: 8 }}>Planes</h1>
      <p style={{ color: "var(--g600)", marginBottom: 24, fontSize: 14 }}>
        Precio del pack semanal de 5 platos, visible para el cliente en <code>/pack</code>.
      </p>

      <form action={savePlan} style={{ display: "grid", gap: 14, border: "1px solid var(--g100)", borderRadius: 12, padding: 20 }}>
        <label style={label}>
          Nombre
          <input name="name" defaultValue={plan?.name ?? "Pack semanal de 5 platos"} style={input} required />
        </label>

        <label style={label}>
          Precio del pack (€)
          <input
            name="price"
            defaultValue={plan ? (plan.priceCents / 100).toFixed(2).replace(".", ",") : ""}
            placeholder="35,00"
            style={input}
            required
          />
        </label>

        <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14.5 }}>
          <input type="checkbox" name="active" defaultChecked={plan?.active ?? false} />
          Activo (visible y comprable en /pack)
        </label>

        {plan && (
          <p style={{ fontSize: 12.5, color: "var(--g600)" }}>
            Precio actual: {formatEuros(plan.priceCents)} · {plan.active ? "Activo" : "Inactivo"}
          </p>
        )}

        <button
          type="submit"
          style={{
            background: "var(--ink)",
            color: "var(--paper)",
            padding: "10px 18px",
            borderRadius: 8,
            border: "none",
            fontSize: 14,
            fontWeight: 500,
            cursor: "pointer",
            justifySelf: "start",
          }}
        >
          Guardar
        </button>
      </form>
    </div>
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
