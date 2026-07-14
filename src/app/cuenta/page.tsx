import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { signOut } from "@/auth";
import { prisma } from "@/lib/prisma";
import { formatEuros } from "@/lib/format";
import { ORDER_STATUS_LABEL, ORDER_STATUS_COLOR } from "@/lib/order-status";
import { RepeatOrderButton } from "./repeat-order-button";

export const dynamic = "force-dynamic";

export default async function CuentaPage() {
  const user = await requireUser();

  const orders = await prisma.order.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: { items: { include: { menuItem: { include: { dish: true } } } } },
  });

  return (
    <div>
      <header style={styles.header}>
        <Link href="/" style={styles.logo}>
          MIR Meal
        </Link>
        <Link href="/menu" style={styles.navLink}>
          Ver el menú
        </Link>
      </header>

      <main style={styles.main}>
        <div style={styles.top}>
          <div>
            <h1 style={styles.title}>Tu cuenta</h1>
            <p style={styles.subtitle}>Hola, {user.name ?? user.email}.</p>
          </div>
          <Link href="/menu" style={styles.primaryButton}>
            Hacer un pedido
          </Link>
        </div>

        {user.role === "ADMIN" && (
          <p style={{ marginBottom: 24 }}>
            <Link href="/admin" style={{ textDecoration: "underline" }}>
              Ir al panel de administración →
            </Link>
          </p>
        )}

        <h2 style={styles.sectionTitle}>Tus pedidos</h2>

        {orders.length === 0 ? (
          <div style={styles.empty}>
            <p style={{ color: "var(--g600)", marginBottom: 14 }}>
              Todavía no has hecho ningún pedido.
            </p>
            <Link href="/menu" style={styles.primaryButton}>
              Ver el menú
            </Link>
          </div>
        ) : (
          <div style={styles.list}>
            {orders.map((order) => (
              <article key={order.id} style={styles.card}>
                <div style={styles.cardHeader}>
                  <div>
                    <div style={styles.cardDate}>
                      {new Intl.DateTimeFormat("es-ES", {
                        day: "numeric",
                        month: "long",
                        timeZone: "UTC",
                      }).format(order.createdAt)}
                    </div>
                    <div style={styles.cardDelivery}>
                      Entrega{" "}
                      {new Intl.DateTimeFormat("es-ES", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                        timeZone: "UTC",
                      }).format(order.deliveryDate)}
                    </div>
                  </div>
                  <span style={{ ...styles.status, color: ORDER_STATUS_COLOR[order.status] }}>
                    {ORDER_STATUS_LABEL[order.status]}
                  </span>
                </div>

                <div style={styles.items}>
                  {order.items.map((item) => (
                    <div key={item.id} style={styles.item}>
                      {item.quantity}× {item.menuItem.dish.name}
                    </div>
                  ))}
                </div>

                <div style={styles.cardFooter}>
                  <span style={styles.total}>{formatEuros(order.totalCents)}</span>
                  <RepeatOrderButton orderId={order.id} />
                </div>
              </article>
            ))}
          </div>
        )}

        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/login" });
          }}
        >
          <button style={styles.signOutButton}>Cerrar sesión</button>
        </form>
      </main>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "18px 24px",
    borderBottom: "1px solid var(--g100)",
  },
  logo: {
    fontFamily: "var(--font-display)",
    fontWeight: 600,
    fontSize: 22,
    textDecoration: "none",
    color: "var(--ink)",
  },
  navLink: { fontSize: 14.5, textDecoration: "none", color: "var(--g600)" },
  main: { maxWidth: 700, margin: "0 auto", padding: "40px 24px 90px" },
  top: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 16,
    flexWrap: "wrap",
    marginBottom: 32,
  },
  title: { fontSize: 32, marginBottom: 6 },
  subtitle: { color: "var(--g600)" },
  primaryButton: {
    height: 42,
    display: "flex",
    alignItems: "center",
    padding: "0 18px",
    background: "var(--ink)",
    color: "var(--paper)",
    borderRadius: "var(--radius)",
    fontSize: 14,
    fontWeight: 500,
    textDecoration: "none",
    whiteSpace: "nowrap",
  },
  sectionTitle: { fontSize: 20, marginBottom: 16 },
  empty: {
    border: "1px solid var(--g100)",
    borderRadius: "var(--radius-card)",
    padding: "32px 24px",
    textAlign: "center",
    marginBottom: 32,
  },
  list: { display: "flex", flexDirection: "column", gap: 14, marginBottom: 40 },
  card: {
    border: "1px solid var(--g100)",
    borderRadius: "var(--radius-card)",
    padding: 18,
  },
  cardHeader: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 12,
    gap: 12,
  },
  cardDate: { fontSize: 15, fontWeight: 500 },
  cardDelivery: { fontSize: 13, color: "var(--g600)", marginTop: 2, textTransform: "capitalize" },
  status: { fontSize: 12.5, fontWeight: 500, whiteSpace: "nowrap" },
  items: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
    paddingBottom: 12,
    marginBottom: 12,
    borderBottom: "1px solid var(--g100)",
  },
  item: { fontSize: 14, color: "var(--g600)" },
  cardFooter: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    flexWrap: "wrap",
  },
  total: { fontFamily: "var(--font-display)", fontSize: 18 },
  signOutButton: {
    height: 42,
    padding: "0 18px",
    background: "transparent",
    color: "var(--ink)",
    border: "1px solid var(--ink)",
    borderRadius: "var(--radius)",
    fontSize: 14,
    cursor: "pointer",
  },
};
