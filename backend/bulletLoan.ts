/**
 * Bullet loan repayment schedule calculator.
 * - Principal is repaid in full on end date; until then only interest is paid monthly (last day of month).
 * - 30/360: each full month uses principal * (annualRate / 12).
 * - Final period: if end date is not month-end, one payment on end date (principal + interest for partial period).
 */

export type PaymentType = "Interest" | "Principal + Interest";

export interface ScheduleRow {
  paymentDate: string;
  paymentType: PaymentType;
  principalComponent: number;
  interestComponent: number;
  totalAmount: number;
  remainingBalance: number;
}

function parseDate(s: string): [number, number, number] {
  const [y, m, d] = s.split("-").map(Number);
  return [y, m - 1, d]; // month 0-indexed for Date
}

function lastDayOfMonth(year: number, month: number): Date {
  return new Date(year, month + 1, 0);
}

function toDateStr(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/**
 * Generate bullet loan schedule with a single stored annual rate (30/360).
 * Interest payments on last day of each calendar month; final payment on end date.
 */
export function generateBulletSchedule(
  principal: number,
  startDate: string,
  endDate: string,
  annualRateDecimal: number
): ScheduleRow[] {
  const [startY, startM, startD] = parseDate(startDate);
  const [endY, endM, endD] = parseDate(endDate);
  const start = new Date(startY, startM, startD);
  const end = new Date(endY, endM, endD);
  const rows: ScheduleRow[] = [];
  let balance = principal;
  const monthlyRate = annualRateDecimal / 12;

  // Monthly interest payments on last day of each month
  let current = new Date(start.getFullYear(), start.getMonth(), 1);
  const endMonth = new Date(end.getFullYear(), end.getMonth(), 1);

  while (current <= endMonth) {
    const year = current.getFullYear();
    const month = current.getMonth();
    const lastDay = lastDayOfMonth(year, month);
    if (lastDay < start) {
      current.setMonth(current.getMonth() + 1);
      continue;
    }
    if (lastDay.getTime() > end.getTime()) break;

    const isLastPayment = lastDay.getTime() === end.getTime();
    const interest = principal * monthlyRate;
    const principalComponent = isLastPayment ? balance : 0;
    const totalAmount = interest + principalComponent;
    balance -= principalComponent;

    rows.push({
      paymentDate: toDateStr(lastDay),
      paymentType: isLastPayment ? "Principal + Interest" : "Interest",
      principalComponent,
      interestComponent: interest,
      totalAmount,
      remainingBalance: balance,
    });
    current.setMonth(current.getMonth() + 1);
  }

  // If end date is not the last day of its month, add final payment on end date
  const endLastDay = lastDayOfMonth(end.getFullYear(), end.getMonth());
  if (end.getTime() !== endLastDay.getTime()) {
    const daysInMonth = endLastDay.getDate();
    const daysInPeriod = end.getDate();
    const interest = (principal * annualRateDecimal * daysInPeriod) / 360;
    const principalComponent = balance;
    const totalAmount = interest + principalComponent;
    balance = 0;
    rows.push({
      paymentDate: endDate,
      paymentType: "Principal + Interest",
      principalComponent,
      interestComponent: interest,
      totalAmount,
      remainingBalance: 0,
    });
  }

  return rows;
}
