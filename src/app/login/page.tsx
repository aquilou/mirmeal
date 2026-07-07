"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    setLoading(false);
    if (res?.error) {
      setError("Correo o contraseña incorrectos.");
      return;
    }
    router.push("/cuenta");
    router.refresh();
  }

  return (
    <main style={styles.main}>
      <div style={styles.card}>
        <h1 style={styles.title}>Iniciar sesión</h1>
        <form onSubmit={onSubmit} style={styles.form}>
          <input
            style={styles.input}
            type="email"
            placeholder="tu@correo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
          <input
            style={styles.input}
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
          {error && <p style={styles.error}>{error}</p>}
          <button style={styles.button} disabled={loading}>
            {loading ? "Entrando…" : "Entrar"}
          </button>
        </form>
        <p style={styles.foot}>
          ¿No tienes cuenta? <a href="/register" style={styles.link}>Regístrate</a>
        </p>
      </div>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  main: { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 },
  card: { width: "100%", maxWidth: 380, border: "1px solid var(--g100)", borderRadius: "var(--radius-card)", padding: 32 },
  title: { fontSize: 28, marginBottom: 22 },
  form: { display: "flex", flexDirection: "column", gap: 12 },
  input: { height: 46, padding: "0 14px", fontSize: 15, border: "1px solid var(--g200)", borderRadius: "var(--radius)", fontFamily: "var(--font-ui)" },
  button: { height: 46, background: "var(--ink)", color: "var(--paper)", border: "none", borderRadius: "var(--radius)", fontSize: 15, fontWeight: 500, cursor: "pointer", marginTop: 4 },
  error: { color: "var(--error)", fontSize: 13.5, margin: 0 },
  foot: { fontSize: 14, color: "var(--g600)", marginTop: 18, textAlign: "center" },
  link: { color: "var(--ink)", textDecoration: "underline" },
};
