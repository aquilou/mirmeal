import Link from "next/link";
import { CustomerForm } from "./customer-form";

export default function NuevoClientePage() {
  return (
    <div>
      <Link href="/admin/clientes" style={{ fontSize: 13.5, color: "var(--g600)", textDecoration: "none" }}>
        ← Clientes
      </Link>
      <h1 style={{ fontSize: 28, margin: "10px 0 20px" }}>Nuevo cliente</h1>
      <CustomerForm />
    </div>
  );
}
