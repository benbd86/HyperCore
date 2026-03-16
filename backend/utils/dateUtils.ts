/**
 * Date helpers for bullet loan schedules.
 * - All date strings are YYYY-MM-DD.
 * - All calculations use JS Date in local time (single time zone assumed).
 */

/** Returns the last day of the given calendar month (month 0-indexed for Date). */
export function lastDayOfMonth(year: number, month: number): Date {
  return new Date(year, month + 1, 0);
}

/** Formats a Date as YYYY-MM-DD. */
export function toDateStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Returns today's date as YYYY-MM-DD (local time). */
export function todayString(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
