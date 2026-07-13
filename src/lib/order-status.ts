import type { OrderStatus } from "@prisma/client";

export const ORDER_STATUSES: OrderStatus[] = [
  "PENDING",
  "PREPARING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "INCIDENT",
];

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  PENDING: "Pendiente",
  PREPARING: "En preparación",
  SHIPPED: "Enviado",
  DELIVERED: "Entregado",
  CANCELLED: "Cancelado",
  INCIDENT: "Incidencia",
};

export const ORDER_STATUS_COLOR: Record<OrderStatus, string> = {
  PENDING: "var(--g600)",
  PREPARING: "var(--info)",
  SHIPPED: "var(--info)",
  DELIVERED: "var(--entregado)",
  CANCELLED: "var(--g400)",
  INCIDENT: "var(--error)",
};
