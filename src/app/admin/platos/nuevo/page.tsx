import { prisma } from "@/lib/prisma";
import { DishForm } from "../dish-form";

export default async function NuevoPlatoPage() {
  const allergens = await prisma.allergen.findMany({ orderBy: { name: "asc" } });

  return (
    <div style={{ maxWidth: 620 }}>
      <a href="/admin/platos" style={{ fontSize: 13.5, color: "var(--g600)", textDecoration: "none" }}>
        ← Platos
      </a>
      <h1 style={{ fontSize: 30, margin: "10px 0 20px" }}>Nuevo plato</h1>
      <DishForm allergens={allergens} />
    </div>
  );
}
