/**
 * Date manipulation and 30/360 day-count helpers for bullet loan schedules.
 * All date strings are YYYY-MM-DD.
 */

/** Parses YYYY-MM-DD into [year, monthIndex, day] (month 0-indexed for Date). */
export function parseDate(s: string): [number, number, number] {
  const [y, m, d] = s.split("-").map(Number);
  return [y, m - 1, d];
}

/** Returns the last day of the given calendar month (month 0-indexed). */
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

/**
 * 30/360 day count: full calendar month (1st to last day of same month) = 30;
 * otherwise 30/360 convention (treat 31st and end-of-Feb as 30, then day difference).
 */
function days30_360(d1Str: string, d2Str: string): number {
  const [y1, m1, d1] = parseDate(d1Str);
  const [y2, m2, d2] = parseDate(d2Str);
  const lastDayM1 = new Date(y1, m1 + 1, 0).getDate();
  const lastDayM2 = new Date(y2, m2 + 1, 0).getDate();
  if (d1 === 1 && y1 === y2 && m1 === m2 && d2 === lastDayM2) return 30;
  let D1 = d1 > 30 ? 30 : d1;
  let D2 = d2 > 30 ? 30 : d2;
  if (m1 === 1 && d1 === lastDayM1) D1 = 30;
  if (m2 === 1 && d2 === lastDayM2) D2 = 30;
  if (D2 === 30 && D1 >= 30) D2 = 30;
  return 360 * (y2 - y1) + 30 * (m2 - m1) + (D2 - D1);
}

/** Adds delta days to a YYYY-MM-DD string and returns YYYY-MM-DD. */
export function addDays(dateStr: string, delta: number): string {
  const [y, m, d] = parseDate(dateStr);
  const d_ = new Date(y, m, d);
  d_.setDate(d_.getDate() + delta);
  return toDateStr(d_);
}

/**
 * Inclusive segment days for a date range: 30 for a full calendar month (1st to last);
 * otherwise days30_360(segStart, segEnd) + 1.
 */
export function segmentDays(segStart: string, segEnd: string): number {
  const d = days30_360(segStart, segEnd);
  const [y1, m1, d1] = parseDate(segStart);
  const [y2, m2, d2] = parseDate(segEnd);
  const lastDayM2 = new Date(y2, m2 + 1, 0).getDate();
  const isFullMonth = d1 === 1 && y1 === y2 && m1 === m2 && d2 === lastDayM2;
  return isFullMonth ? 30 : d + 1;
}

/**
 * Effective days for a period (used for interest proration).
 * When periodStart === periodEnd: 0 if that day is the loan start (first period, no elapsed time), else 1.
 * Full calendar month => 30; else 30/360 day count.
 */
export function effectiveDaysInPeriod(
  periodStart: string,
  periodEnd: string,
  loanStartDate?: string
): number {
  if (periodStart === periodEnd) {
    return loanStartDate !== undefined && periodStart === loanStartDate ? 0 : 1;
  }
  const [y1, m1, d1] = parseDate(periodStart);
  const [y2, m2, d2] = parseDate(periodEnd);
  const lastM2 = new Date(y2, m2 + 1, 0).getDate();
  const fullMonth = d1 === 1 && y1 === y2 && m1 === m2 && d2 === lastM2;
  return fullMonth ? 30 : days30_360(periodStart, periodEnd);
}

/** Returns today's date as YYYY-MM-DD (local time). */
export function todayString(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
