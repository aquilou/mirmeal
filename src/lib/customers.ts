"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

const schema = z.object({
  name: z.string().trim().min(1, "El nombre es obligatorio").max(120),
  email: z.string().trim().email("Correo no válido"),
  phone: z.string().trim().max(30).optional().or(z.literal("")),
});

export type CustomerState = { error?: string };

/** Crea un cliente a mano (sin contraseña: no puede iniciar sesión, solo sirve para asociarle pedidos). */
export async function createCustomer(
  _prevState: CustomerState,
  formData: FormData
): Promise<CustomerState> {
  await requireAdmin();

  const parsed = schema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone") ?? "",
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Revisa los datos." };
  }

  const existing = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (existing) {
    return { error: "Ya existe un usuario con ese correo." };
  }

  const customer = await prisma.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone || null,
      role: "CUSTOMER",
      passwordHash: null,
    },
  });

  redirect(`/admin/clientes/${customer.id}`);
}
