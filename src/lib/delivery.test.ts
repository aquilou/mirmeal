import { test } from "node:test";
import assert from "node:assert/strict";
import { computeDeliveryDate } from "./delivery.ts";

function iso(d: Date) {
  return d.toISOString().slice(0, 10);
}

test("domingo a miércoles → viernes de esa semana", () => {
  assert.equal(iso(computeDeliveryDate(new Date("2026-07-12T09:00:00"))), "2026-07-17"); // Dom
  assert.equal(iso(computeDeliveryDate(new Date("2026-07-06T09:00:00"))), "2026-07-10"); // Lun
  assert.equal(iso(computeDeliveryDate(new Date("2026-07-07T09:00:00"))), "2026-07-10"); // Mar
  assert.equal(iso(computeDeliveryDate(new Date("2026-07-08T09:00:00"))), "2026-07-10"); // Mié
});

test("jueves a sábado → lunes siguiente", () => {
  assert.equal(iso(computeDeliveryDate(new Date("2026-07-09T09:00:00"))), "2026-07-13"); // Jue
  assert.equal(iso(computeDeliveryDate(new Date("2026-07-10T09:00:00"))), "2026-07-13"); // Vie
  assert.equal(iso(computeDeliveryDate(new Date("2026-07-11T09:00:00"))), "2026-07-13"); // Sáb
});
