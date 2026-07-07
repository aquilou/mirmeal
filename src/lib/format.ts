/** Formatea céntimos (Int) a texto en euros: 850 -> "8,50 €" */
export function formatEuros(cents: number): string {
  return (cents / 100).toFixed(2).replace(".", ",") + " €";
}
