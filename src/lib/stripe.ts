import Stripe from "stripe";

let cached: Stripe | null = null;

/**
 * Cliente Stripe server-side. La inicialización es perezosa (solo al llamar
 * getStripe(), no al importar el módulo) para que el resto de la app (build,
 * checkout hasta el momento de pagar) siga funcionando sin claves configuradas.
 */
export function getStripe(): Stripe {
  if (cached) return cached;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error(
      "STRIPE_SECRET_KEY no está configurada. Añádela a .env antes de aceptar pagos."
    );
  }
  cached = new Stripe(key);
  return cached;
}
