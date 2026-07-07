export default function Home() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "20px",
        padding: "24px",
        textAlign: "center",
      }}
    >
      <svg
        viewBox="0 0 200 210"
        width="72"
        fill="none"
        stroke="var(--ink)"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-label="MIR Meal"
      >
        <path d="M124.6 50.3 A72 72 0 1 1 75.4 50.3" />
        <polyline points="75,50 92,45 100,20 108,45 125,50" />
        <line x1="88" y1="76" x2="88" y2="104" />
        <line x1="100" y1="76" x2="100" y2="104" />
        <line x1="112" y1="76" x2="112" y2="104" />
        <path d="M88 104 L100 114 L112 104" />
        <line x1="100" y1="114" x2="100" y2="154" />
      </svg>

      <h1 style={{ fontSize: "34px" }}>MIR Meal</h1>
      <p style={{ color: "var(--g600)", maxWidth: "40ch" }}>
        Esqueleto de la aplicación listo. Base de datos, identidad de marca y la
        lógica de reparto ya conectadas. Empezamos a construir las pantallas.
      </p>
      <p style={{ fontSize: "13px", color: "var(--g400)" }}>
        Comprobar conexión a la base de datos:{" "}
        <a href="/api/health" style={{ textDecoration: "underline" }}>
          /api/health
        </a>
      </p>
    </main>
  );
}
