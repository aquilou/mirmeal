import Link from "next/link";
import { auth } from "@/auth";

export default async function Home() {
  const session = await auth();

  return (
    <div>
      <header style={styles.header}>
        <Link href="/" style={styles.logo}>
          <svg
            viewBox="0 0 200 210"
            width="26"
            fill="none"
            stroke="var(--ink)"
            strokeWidth="8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M124.6 50.3 A72 72 0 1 1 75.4 50.3" />
            <polyline points="75,50 92,45 100,20 108,45 125,50" />
            <line x1="88" y1="76" x2="88" y2="104" />
            <line x1="100" y1="76" x2="100" y2="104" />
            <line x1="112" y1="76" x2="112" y2="104" />
            <path d="M88 104 L100 114 L112 104" />
            <line x1="100" y1="114" x2="100" y2="154" />
          </svg>
          <span style={styles.logoText}>MIR Meal</span>
        </Link>
        <nav style={styles.nav}>
          {session?.user ? (
            <Link href="/cuenta" style={styles.navLink}>
              Mi cuenta
            </Link>
          ) : (
            <>
              <Link href="/login" style={styles.navLink}>
                Iniciar sesión
              </Link>
              <Link href="/register" style={styles.navButton}>
                Crear cuenta
              </Link>
            </>
          )}
        </nav>
      </header>

      <main style={styles.hero}>
        <h1 style={styles.heroTitle}>Comida real, tiempo para estudiar.</h1>
        <p style={styles.heroSubtitle}>
          Platos caseros listos para calentar, entregados en tu puerta cada
          semana. Elige a la carta, en pack o por suscripción.
        </p>
        <div style={styles.heroActions}>
          <Link href="/menu" style={styles.primaryButton}>
            Ver el menú
          </Link>
          <Link href="/register" style={styles.secondaryButton}>
            Crear cuenta
          </Link>
        </div>
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
    display: "flex",
    alignItems: "center",
    gap: 10,
    textDecoration: "none",
  },
  logoText: {
    fontFamily: "var(--font-display)",
    fontWeight: 600,
    fontSize: 22,
    color: "var(--ink)",
  },
  nav: { display: "flex", alignItems: "center", gap: 18 },
  navLink: { fontSize: 14.5, textDecoration: "none", color: "var(--g600)" },
  navButton: {
    height: 38,
    display: "flex",
    alignItems: "center",
    padding: "0 16px",
    background: "var(--ink)",
    color: "var(--paper)",
    borderRadius: "var(--radius)",
    fontSize: 14.5,
    fontWeight: 500,
    textDecoration: "none",
  },
  hero: {
    textAlign: "center",
    padding: "clamp(64px, 14vh, 120px) 24px 96px",
    maxWidth: 640,
    margin: "0 auto",
  },
  heroTitle: { fontSize: "clamp(32px, 5vw, 44px)", marginBottom: 18 },
  heroSubtitle: { fontSize: 17, color: "var(--g600)", marginBottom: 32 },
  heroActions: {
    display: "flex",
    gap: 14,
    justifyContent: "center",
    flexWrap: "wrap",
  },
  primaryButton: {
    height: 48,
    display: "flex",
    alignItems: "center",
    padding: "0 24px",
    background: "var(--ink)",
    color: "var(--paper)",
    borderRadius: "var(--radius)",
    fontSize: 15,
    fontWeight: 500,
    textDecoration: "none",
  },
  secondaryButton: {
    height: 48,
    display: "flex",
    alignItems: "center",
    padding: "0 24px",
    border: "1px solid var(--g200)",
    borderRadius: "var(--radius)",
    fontSize: 15,
    fontWeight: 500,
    textDecoration: "none",
    color: "var(--ink)",
  },
};
