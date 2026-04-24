/**
 * Formats a birth-date string stored as "YYYY-MM-DD" (or ISO datetime)
 * into the Brazilian "DD/MM/YYYY" format.
 */
export function formatBirthDate(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const [datePart] = raw.split("T");
  const parts = datePart.split("-");
  if (parts.length !== 3) return raw;
  const [year, month, day] = parts;
  return `${day}/${month}/${year}`;
}

/**
 * Formats a price in cents to the Brazilian Real (BRL) currency format.
 * Returns "Gratuito" when the amount is zero.
 */
export function formatPriceBRL(cents: number): string {
  if (cents === 0) return "Gratuito";
  return (cents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}
