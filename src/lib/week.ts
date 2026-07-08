/** Devuelve el lunes (a medianoche UTC) de la semana que contiene `d`. */
export function mondayOf(d: Date): Date {
  const date = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const day = date.getUTCDay(); // 0 domingo ... 6 sábado
  const diff = (day + 6) % 7; // días transcurridos desde el lunes
  date.setUTCDate(date.getUTCDate() - diff);
  return date;
}

/** Convierte un "YYYY-MM-DD" del selector en el lunes de esa semana. */
export function mondayFromInput(value: string): Date {
  return mondayOf(new Date(value + "T00:00:00Z"));
}

/** Etiqueta legible: "Semana del 14 al 20 de julio". */
export function weekLabel(monday: Date): string {
  const sunday = new Date(monday);
  sunday.setUTCDate(sunday.getUTCDate() + 6);
  const month = new Intl.DateTimeFormat("es-ES", { month: "long", timeZone: "UTC" }).format(sunday);
  return `Semana del ${monday.getUTCDate()} al ${sunday.getUTCDate()} de ${month}`;
}

/** Formato corto "YYYY-MM-DD" en UTC (para value de inputs date). */
export function toInputValue(d: Date): string {
  return d.toISOString().slice(0, 10);
}
