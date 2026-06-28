const BRL = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

/** Format integer cents as "R$ 1.234,56" */
export function formatBRL(cents) {
  return BRL.format(cents / 100);
}

/**
 * Parse a user-typed string (e.g. "1234,56" or "1.234,56" or "1234.56") to cents (integer).
 * Returns NaN if unparseable.
 */
export function parseBRL(str) {
  if (!str && str !== 0) return NaN;
  // Remove currency symbol and whitespace
  const clean = String(str).replace(/[R$\s]/g, '').trim();
  // Detect comma-as-decimal (pt-BR) vs dot-as-decimal
  // "1.234,56" → pt-BR; "1234.56" → en
  let normalized;
  if (clean.includes(',')) {
    // Remove thousand dots, replace comma decimal with dot
    normalized = clean.replace(/\./g, '').replace(',', '.');
  } else {
    // Remove thousand commas if any
    normalized = clean.replace(/,/g, '');
  }
  const value = parseFloat(normalized);
  if (isNaN(value)) return NaN;
  return Math.round(value * 100);
}

/** Cents integer to a display-friendly string "1234,56" for <input> population */
export function centsToInput(cents) {
  return (cents / 100).toFixed(2).replace('.', ',');
}
