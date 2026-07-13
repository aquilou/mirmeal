"use client";

import { useActionState } from "react";
import type { OrderStatus } from "@prisma/client";
import { updateOrderStatus, type UpdateStatusState } from "@/lib/order-admin";
import { ORDER_STATUSES, ORDER_STATUS_LABEL } from "@/lib/order-status";
import { Toast } from "@/components/toast";

const initialState: UpdateStatusState = {};

export function StatusForm({ orderId, currentStatus }: { orderId: string; currentStatus: OrderStatus }) {
  const [state, formAction, pending] = useActionState(updateOrderStatus, initialState);

  return (
    <>
      <form action={formAction} style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <input type="hidden" name="id" value={orderId} />
        <select name="status" defaultValue={currentStatus} style={select}>
          {ORDER_STATUSES.map((s) => (
            <option key={s} value={s}>{ORDER_STATUS_LABEL[s]}</option>
          ))}
        </select>
        <button type="submit" disabled={pending} style={{ ...saveBtn, opacity: pending ? 0.7 : 1 }}>
          {pending ? "Guardando…" : "Guardar"}
        </button>
      </form>
      <Toast message="Estado del pedido actualizado." trigger={state.updatedAt} />
    </>
  );
}

const select: React.CSSProperties = {
  height: 42,
  padding: "0 12px",
  fontSize: 14.5,
  border: "1px solid var(--g200)",
  borderRadius: 8,
  fontFamily: "inherit",
};
const saveBtn: React.CSSProperties = {
  height: 42,
  padding: "0 18px",
  background: "var(--ink)",
  color: "var(--paper)",
  border: "none",
  borderRadius: 8,
  fontSize: 14,
  fontWeight: 500,
  cursor: "pointer",
  fontFamily: "inherit",
};
