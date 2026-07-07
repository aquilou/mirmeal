"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "No se pudo crear la cuenta.");
      setLoading(false);
      return;
    }

    // Alta correcta → iniciar sesión directamente.
    await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    router.push("/cuenta");
    router.refresh();
  }

  return (
    <main style={styles.main}>
      <div style={styles.card}>
        <h1 style={styles.title}>Crear cuenta</h1>
        <form onSubmit={onSubmit} style={styles.form}>
          <input style={styles.input} placeholder="Nombre" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
          <input style={styles.input} type="email" placeholder="tu@correo.com" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required />
          <input style={styles.input} type="password" placeholder="Contraseña (mínimo 8)" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" required />
          {error && <p style={styles.error}>{error}</p>}
          <button style={styles.button} disabled={loading}>
            {loading ? "Creando…" : "Crear cuenta"}
          </button>
        </form>
        <p style={styles.foot}>
          ¿Ya tienes cuenta? <a href="/login" style={styles.link}>Inicia sesión</a>
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
