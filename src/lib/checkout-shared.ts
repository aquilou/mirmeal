import { z } from "zod";
import type { Prisma } from "@prisma/client";

/** Error de negocio (dirección inválida, sin cupo, carrito vacío): se muestra tal cual al usuario/admin. */
export class CheckoutError extends Error {}

export const cartItemSchema = z.object({
  menuItemId: z.string().min(1),
  quantity: z.number().int().min(1),
});

export const addressSchema = z.object({
  label: z.string().trim().max(60).optional().or(z.literal("")),
  street: z.string().trim().min(1, "La calle es obligatoria").max(200),
  city: z.string().trim().min(1, "La ciudad es obligatoria").max(120),
  postalCode: z.string().trim().min(1, "El código postal es obligatorio").max(12),
  notes: z.string().trim().max(300).optional().or(z.literal("")),
});

export function parseCartItems(raw: FormDataEntryValue | null) {
  if (!raw || typeof raw !== "string") throw new CheckoutError("El pedido está vacío.");
  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch {
    throw new CheckoutError("El pedido no es válido.");
  }
  const parsed = z.array(cartItemSchema).min(1, "El pedido está vacío.").safeParse(json);
  if (!parsed.success) throw new CheckoutError("El pedido no es válido.");
  return parsed.data;
}

/** Relee cada MenuItem en servidor, valida cupo disponible y resuelve el precio real (nunca el del cliente). */
export async function resolveOrderLines(
  tx: Prisma.TransactionClient,
  items: { menuItemId: string; quantity: number }[]
) {
  const resolvedItems: { menuItemId: string; name: string; unitPriceCents: number; quantity: number }[] = [];
  for (const item of items) {
    const menuItem = await tx.menuItem.findUnique({
      where: { id: item.menuItemId },
      include: { dish: true },
    });
    if (!menuItem) throw new CheckoutError("Alguno de los platos elegidos ya no está disponible.");
    const available = menuItem.capacity - menuItem.sold;
    if (available < item.quantity) {
      throw new CheckoutError(`Ya no quedan suficientes unidades de "${menuItem.dish.name}".`);
    }
    resolvedItems.push({
      menuItemId: item.menuItemId,
      name: menuItem.dish.name,
      unitPriceCents: menuItem.priceCentsOverride ?? menuItem.dish.priceCents,
      quantity: item.quantity,
    });
  }
  return resolvedItems;
}

export async function resolveOrCreateAddress(
  tx: Prisma.TransactionClient,
  userId: string,
  formData: FormData
) {
  const addressId = String(formData.get("addressId") ?? "");

  if (addressId && addressId !== "new") {
    const existing = await tx.address.findFirst({ where: { id: addressId, userId } });
    if (!existing) throw new CheckoutError("La dirección seleccionada no es válida.");
    return existing;
  }

  const parsed = addressSchema.safeParse({
    label: formData.get("label") ?? "",
    street: formData.get("street") ?? "",
    city: formData.get("city") ?? "",
    postalCode: formData.get("postalCode") ?? "",
    notes: formData.get("notes") ?? "",
  });
  if (!parsed.success) {
    throw new CheckoutError(parsed.error.issues[0]?.message ?? "Revisa los datos de la dirección.");
  }

  const hasAddresses = (await tx.address.count({ where: { userId } })) > 0;

  return tx.address.create({
    data: {
      userId,
      label: parsed.data.label || null,
      street: parsed.data.street,
      city: parsed.data.city,
      postalCode: parsed.data.postalCode,
      notes: parsed.data.notes || null,
      isDefault: !hasAddresses,
    },
  });
}
