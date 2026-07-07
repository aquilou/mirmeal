import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { DishForm } from "../dish-form";

export default async function EditarPlatoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [dish, allergens] = await Promise.all([
    prisma.dish.findUnique({ where: { id }, include: { allergens: true } }),
    prisma.allergen.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!dish) notFound();

  return (
    <div style={{ maxWidth: 620 }}>
      <a href="/admin/platos" style={{ fontSize: 13.5, color: "var(--g600)", textDecoration: "none" }}>
        ← Platos
      </a>
      <h1 style={{ fontSize: 30, margin: "10px 0 20px" }}>Editar plato</h1>
      <DishForm allergens={allergens} dish={dish} />
    </div>
  );
}
