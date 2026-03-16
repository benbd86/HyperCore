/**
 * Bullet loan schedule per documents/bullet_loan_logic.txt.
 * 1. Get relevant prime rates via getInitialRateAndChangesInPeriod (future: latest only; past/ongoing: initial + changes in range).
 * 2. Create payments via createPaymentsSchedule: for each month, effective days and prime changes in month; interest by 2.b.i or 2.b.ii.
 * Only exported function: createLoanSchedule.
 */

import type { PrimeRateObservation } from "./scrapers/primeScraper.js";
import {
  getCurrentPrimeRateAsDecimal,
  getPrimeRateForDateRange,
} from "./primeRate.js";
import {
  parseDate,
  lastDayOfMonth,
  toDateStr,
  addDays,
  segmentDays,
  effectiveDaysInPeriod,
  todayString,
} from "./utils/dateUtils.js";

export type PaymentType = "Interest" | "Principal + Interest";

export interface ScheduleRow {
  paymentDate: string;
  paymentType: PaymentType;
  principalComponent: number;
  interestComponent: number;
  totalAmount: number;
  remainingBalance: number;
  primeRateRange: string;
}

/** Step 1: Collect initial rate and all prime changes in the loan period (per doc 1.a–1.c). */
async function getInitialRateAndChangesInPeriod(
  startDate: string,
  endDate: string,
): Promise<{ initialRatePercent: number; observations: PrimeRateObservation[] }> {
  const today = todayString();
  const currentPrimeDecimal = await getCurrentPrimeRateAsDecimal();
  if (startDate > today) {
    return { initialRatePercent: currentPrimeDecimal * 100, observations: [] };
  }
  const scrapeEnd = endDate < today ? endDate : today;
  const result = await getPrimeRateForDateRange(startDate, scrapeEnd);
  return {
    initialRatePercent: result.initialRatePercent,
    observations: result.observations,
  };
}

/** Rate (decimal) in effect at date from initial + observations; uses currentPrime for dates after last observation. */
function getRateAtDate(
  date: string,
  initialPercent: number,
  observations: PrimeRateObservation[],
  currentPrimeDecimal: number
): number {
  if (observations.length === 0) return initialPercent / 100;
  const lastObs = observations[observations.length - 1];
  if (date > lastObs.date) return currentPrimeDecimal;
  const first = observations[0];
  if (date < first.date) return initialPercent / 100;
  let rate = first.value / 100;
  for (const obs of observations) {
    if (obs.date <= date) rate = obs.value / 100;
    else break;
  }
  return rate;
}

/** Observations inside (periodStart, periodEnd]. */
function getChangesInMonth(
  periodStart: string,
  periodEnd: string,
  observations: PrimeRateObservation[]
): PrimeRateObservation[] {
  return observations.filter(
    (o) => o.date > periodStart && o.date <= periodEnd
  );
}

/** Interest and prime range for one period. Returns interest and a label from min/max rates in the period. */
function interestAndPrimeRangeForMonth(
  principal: number,
  periodStart: string,
  periodEnd: string,
  initialPercent: number,
  observations: PrimeRateObservation[],
  currentPrimeDecimal: number,
  loanStartDate: string
): { interest: number; primeRateRange: string } {
  const effectiveDays = effectiveDaysInPeriod(
    periodStart,
    periodEnd,
    loanStartDate
  );
  if (effectiveDays === 0) {
    return { interest: 0, primeRateRange: "" };
  }

  const changes = getChangesInMonth(
    periodStart,
    periodEnd,
    observations
  );

  if (changes.length === 0) {
    const rate = getRateAtDate(
      periodStart,
      initialPercent,
      observations,
      currentPrimeDecimal
    );
    const ratePercent = Math.round(rate * 100 * 100) / 100;
    const interest =
      Math.round((principal * (rate / 12) * (effectiveDays / 30)) * 100) / 100;
    return {
      interest,
      primeRateRange: `${ratePercent.toFixed(2)}%`,
    };
  }

  const sorted = [...observations].sort((a, b) => a.date.localeCompare(b.date));
  const bounds: string[] = [periodStart];
  for (const obs of sorted) {
    if (obs.date > periodStart && obs.date <= periodEnd) bounds.push(obs.date);
  }
  if (bounds[bounds.length - 1] !== periodEnd) bounds.push(periodEnd);

  const ratePercents: number[] = [];
  let total = 0;
  for (let i = 0; i < bounds.length - 1; i++) {
    const segStart = bounds[i];
    const segEnd =
      bounds[i + 1] === periodEnd ? periodEnd : addDays(bounds[i + 1], -1);
    if (segStart > segEnd) continue;
    const rate = getRateAtDate(
      segStart,
      initialPercent,
      observations,
      currentPrimeDecimal
    );
    ratePercents.push(Math.round(rate * 100 * 100) / 100);
    const days = segmentDays(segStart, segEnd);
    total += principal * (rate / 360) * days;
  }
  if (bounds.length === 1) {
    const rate = getRateAtDate(
      periodStart,
      initialPercent,
      observations,
      currentPrimeDecimal
    );
    ratePercents.push(Math.round(rate * 100 * 100) / 100);
    total =
      principal * (rate / 360) * segmentDays(periodStart, periodEnd);
  }
  const uniq = [...new Set(ratePercents)].sort((a, b) => a - b);
  const primeRateRange =
    uniq.length === 0
      ? ""
      : uniq.length === 1
        ? `${uniq[0].toFixed(2)}%`
        : `${uniq[0].toFixed(2)}% - ${uniq[uniq.length - 1].toFixed(2)}%`;
  return {
    interest: Math.round(total * 100) / 100,
    primeRateRange,
  };
}

/**
 * Step 2: Create payment schedule. For each month: get changes in that month; calculate interest (2.b.i or 2.b.ii); keep latest rate for next month (via getRateAtDate).
 */
function createPaymentsSchedule(
  principal: number,
  startDate: string,
  endDate: string,
  initialRatePercent: number,
  observations: PrimeRateObservation[],
  currentPrimeDecimal: number
): ScheduleRow[] {
  const [startY, startM, startD] = parseDate(startDate);
  const [endY, endM, endD] = parseDate(endDate);
  const start = new Date(startY, startM, startD);
  const end = new Date(endY, endM, endD);
  const rows: ScheduleRow[] = [];
  let balance = principal;
  let periodStartStr = startDate;

  let current = new Date(start.getFullYear(), start.getMonth(), 1);
  const endMonth = new Date(end.getFullYear(), end.getMonth(), 1);

  while (current <= endMonth) {
    const lastDay = lastDayOfMonth(current.getFullYear(), current.getMonth());
    if (lastDay.getTime() < start.getTime()) {
      current.setMonth(current.getMonth() + 1);
      continue;
    }
    if (lastDay.getTime() > end.getTime()) break;

    const paymentDateStr = toDateStr(lastDay);
    const isLastPayment = lastDay.getTime() === end.getTime();
    const { interest, primeRateRange } = interestAndPrimeRangeForMonth(
      principal,
      periodStartStr,
      paymentDateStr,
      initialRatePercent,
      observations,
      currentPrimeDecimal,
      startDate
    );
    const principalComponent = isLastPayment ? balance : 0;
    const totalAmount = interest + principalComponent;
    balance -= principalComponent;

    rows.push({
      paymentDate: paymentDateStr,
      paymentType: isLastPayment ? "Principal + Interest" : "Interest",
      principalComponent,
      interestComponent: interest,
      totalAmount,
      remainingBalance: balance,
      primeRateRange,
    });

    periodStartStr = addDays(paymentDateStr, 1);
    current.setMonth(current.getMonth() + 1);
  }

  // In case the last payment wasn't a full month add a payment for the remaining days in the last month.
  const endLastDay = lastDayOfMonth(end.getFullYear(), end.getMonth());
  if (end.getTime() !== endLastDay.getTime()) {
    const { interest, primeRateRange } = interestAndPrimeRangeForMonth(
      principal,
      periodStartStr,
      endDate,
      initialRatePercent,
      observations,
      currentPrimeDecimal,
      startDate
    );
    rows.push({
      paymentDate: endDate,
      paymentType: "Principal + Interest",
      principalComponent: balance,
      interestComponent: interest,
      totalAmount: interest + balance,
      remainingBalance: 0,
      primeRateRange,
    });
  }

  return rows;
}

export interface CreateLoanScheduleResult {
  schedule: ScheduleRow[];
  annualRate: number;
}

export interface PrimeOverride {
  initialRatePercent: number;
  observations: PrimeRateObservation[];
}

/**
 * Only exported schedule entry point. Gets prime data (getInitialRateAndChangesInPeriod) then builds schedule (createPaymentsSchedule).
 * Pass primeOverride to skip fetch (e.g. for tests with a single rate).
 */
export async function createLoanSchedule(
  principalAmount: number,
  startDate: string,
  endDate: string,
): Promise<CreateLoanScheduleResult> {

  const annualRateDecimal: number = await getCurrentPrimeRateAsDecimal();
  const prime = await getInitialRateAndChangesInPeriod(
    startDate,
    endDate,
  );
  const initialRatePercent: number = prime.initialRatePercent;
  const observations: PrimeRateObservation[] = prime.observations;

  const schedule: ScheduleRow[] = createPaymentsSchedule(
    principalAmount,
    startDate,
    endDate,
    initialRatePercent,
    observations,
    annualRateDecimal
  );

  return {
    schedule,
    annualRate: annualRateDecimal,
  };
}
