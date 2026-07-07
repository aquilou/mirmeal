/**
 * Regla de reparto de MIR Meal:
 *   - Pedidos de domingo a miércoles  → se entregan el VIERNES de esa semana.
 *   - Pedidos de jueves a sábado       → se entregan el LUNES siguiente.
 *
 * Función pura y sin dependencias: fácil de testear y de reutilizar en
 * el checkout, en la generación de pedidos de suscripción y en el panel.
 */

export type DeliveryDay = "MONDAY" | "FRIDAY";

const SUNDAY = 0;
const WEDNESDAY = 3;
const MONDAY_INDEX = 1;
const FRIDAY_INDEX = 5;

/** Devuelve la fecha de entrega (a medianoche) para un pedido hecho en `orderDate`. */
export function computeDeliveryDate(orderDate: Date): Date {
  const day = orderDate.getDay(); // 0 = domingo ... 6 = sábado
  const targetWeekday =
    day >= SUNDAY && day <= WEDNESDAY ? FRIDAY_INDEX : MONDAY_INDEX;

  const result = new Date(orderDate);
  result.setHours(0, 0, 0, 0);

  // Avanza hasta el próximo día objetivo (nunca el mismo día).
  const diff = ((targetWeekday - day + 7) % 7) || 7;
  result.setDate(result.getDate() + diff);
  return result;
}

/** Etiqueta del día de entrega, útil para la interfaz. */
export function deliveryDayLabel(orderDate: Date): DeliveryDay {
  const day = orderDate.getDay();
  return day >= SUNDAY && day <= WEDNESDAY ? "FRIDAY" : "MONDAY";
}
