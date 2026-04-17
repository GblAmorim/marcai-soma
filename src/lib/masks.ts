export function maskCpf(value: string): string {
  return value
    .replace(/\D/g, "")
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

export function maskRg(value: string): string {
  return value
    .replace(/[^\dXx]/g, "")
    .slice(0, 9)
    .replace(/(\d{2})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})([\dXx]{1})$/, "$1-$2");
}

export function maskPhone(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 2) return digits.replace(/(\d+)/, "($1");
  if (digits.length <= 7) return digits.replace(/(\d{2})(\d+)/, "($1) $2");
  return digits.replace(/(\d{2})(\d{5})(\d+)/, "($1) $2-$3");
}

/** Strips all non-digit/non-X chars for CPF/RG comparison */
export function normalizeDoc(value: string): string {
  return value.replace(/[^\dXx]/gi, "").toLowerCase();
}
