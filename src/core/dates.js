/**
 * All date-only values are YYYY-MM-DD strings.
 * Using strings avoids timezone bugs where new Date() shifts the date by the local offset.
 */

/** Today as YYYY-MM-DD */
export function today() {
  const d = new Date();
  return localDateString(d);
}

/** Convert a JS Date to YYYY-MM-DD in local time */
export function localDateString(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Current month as YYYY-MM */
export function currentMonth() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

/** Whether a YYYY-MM-DD date string falls in the given YYYY-MM month */
export function isInMonth(dateStr, month) {
  return dateStr.startsWith(month);
}

/** Whether a YYYY-MM-DD date is before today (overdue) */
export function isOverdue(dateStr) {
  return dateStr < today();
}

/** Whether a YYYY-MM-DD date is today */
export function isToday(dateStr) {
  return dateStr === today();
}

/**
 * Human-readable display of a YYYY-MM-DD date.
 * E.g. "28 jun." or "28 jun. 2025" if different year.
 */
export function toDisplay(dateStr) {
  // Parse parts directly from string to avoid timezone shift
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  const nowYear = new Date().getFullYear();
  const opts = nowYear === y
    ? { day: 'numeric', month: 'short' }
    : { day: 'numeric', month: 'short', year: 'numeric' };
  return date.toLocaleDateString('pt-BR', opts);
}

/** Compare two YYYY-MM-DD strings. Returns -1, 0, or 1. */
export function compareDates(a, b) {
  if (a < b) return -1;
  if (a > b) return 1;
  return 0;
}

/** Extract YYYY-MM from a YYYY-MM-DD string */
export function toMonth(dateStr) {
  return dateStr.slice(0, 7);
}

/** Month label for display, e.g. "Junho 2025" */
export function monthLabel(month) {
  const [y, m] = month.split('-').map(Number);
  const d = new Date(y, m - 1, 1);
  return d.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
}

/** Add/subtract months from a YYYY-MM string */
export function shiftMonth(month, delta) {
  const [y, m] = month.split('-').map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}
