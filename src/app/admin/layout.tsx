import { requireAdmin } from "@/lib/auth";
import { signOut } from "@/auth";
import { AdminNav } from "./admin-nav";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <aside
        style={{
          width: 190,
          flex: "none",
          background: "var(--surface)",
          borderRight: "1px solid var(--g100)",
          padding: "18px 12px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 9, padding: "4px 8px 18px" }}>
          <svg viewBox="0 0 200 210" width="22" fill="none" stroke="var(--ink)" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M124.6 50.3 A72 72 0 1 1 75.4 50.3" />
            <polyline points="75,50 92,45 100,20 108,45 125,50" />
            <line x1="88" y1="76" x2="88" y2="104" />
            <line x1="100" y1="76" x2="100" y2="104" />
            <line x1="112" y1="76" x2="112" y2="104" />
            <path d="M88 104 L100 114 L112 104" />
            <line x1="100" y1="114" x2="100" y2="154" />
          </svg>
          <span style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 18 }}>
            MIR Meal
          </span>
        </div>

        <AdminNav />

        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/login" });
          }}
          style={{ marginTop: "auto" }}
        >
          <button
            style={{
              width: "100%",
              height: 38,
              background: "transparent",
              color: "var(--g600)",
              border: "1px solid var(--g100)",
              borderRadius: 8,
              fontSize: 13,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            Cerrar sesión
          </button>
        </form>
      </aside>

      <main style={{ flex: 1, minWidth: 0, padding: "28px 32px" }}>{children}</main>
    </div>
  );
}
