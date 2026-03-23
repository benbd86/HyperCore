import {
  getCurrentPrimeRateAsDecimal,
  getPrimeRateForDateRange,
} from "./primeRateService.js";
import type { PrimeRateObservation } from "./scrapers/primeScraper.js";
import { WorkDaysPaymentType } from "./entities/Loan.js";
import {
  lastDayOfMonth,
  toDateStr,
  todayString
} from "./utils/dateUtils.js";

export type PaymentType = "Interest" | "Principal + Interest";

export interface ScheduleRow {
  paymentDate: string;
  paymentType: PaymentType;
  principalComponent: number;
  interestComponent: number;
  totalAmount: number;
  remainingBalance: number;
  /** Prime rate range in effect for this payment period (e.g. "7.25%" or "7.00% - 7.25%"). */
  primeRateRange: string;
}

const MILLIS_IN_DAY = 1000 * 60 * 60 * 24; 

/**
 * Only exported schedule entry point.
 * 1) Fetches the prime rate history relevant for the loan dates (future vs past/ongoing).
 * 2) Builds a monthly bullet schedule using that history via createPaymentsSchedule.
 */
export async function createLoanSchedule(
  principalAmount: number,
  startDate: string,
  endDate: string,
  workDaysPayments: WorkDaysPaymentType,
): Promise<ScheduleRow[]> {

  const prime = await getRelevantRatesForLoanDates(
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
    workDaysPayments,
  );

  return schedule;
}

/** Step 1: Collect initial rate and all prime changes in the loan period. */
async function getRelevantRatesForLoanDates(
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

/**
 * Step 2: Create payment schedule. For each month: get changes in that month; calculate interest (2.b.i or 2.b.ii); keep latest rate for next month (via getRateAtDate).
 */
function createPaymentsSchedule(
  principal: number,
  startDate: string,
  endDate: string,
  initialRatePercent: number,
  observations: PrimeRateObservation[],
  workDaysPayments: WorkDaysPaymentType,
): ScheduleRow[] {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const payments: ScheduleRow[] = [];
  let balance = principal;
  let periodStartDate: Date = new Date(startDate);
  let effectiveRate = initialRatePercent;

  let currentMonth = new Date(start.getFullYear(), start.getMonth(), 1);
  const endMonth = new Date(end.getFullYear(), end.getMonth(), 1);

  while (currentMonth <= endMonth) {
    const isLastPayment = currentMonth.getMonth() === endMonth.getMonth() && currentMonth.getFullYear() === endMonth.getFullYear();
    const paymentDate = getPaymentDate(currentMonth, isLastPayment, end, workDaysPayments);

    const { initialRatePercent, relevantObservations } = getRelevantRatesForPayment(
      effectiveRate,
      toDateStr(periodStartDate),
      toDateStr(paymentDate),
      observations
    );

    // Update effective rate for next month.
    effectiveRate = relevantObservations.length > 0 ? relevantObservations[relevantObservations.length - 1].value : initialRatePercent;

    const { interest, primeRateRange } = interestAndPrimeRangeForMonth(
      principal,
      periodStartDate,
      paymentDate,
      initialRatePercent,
      relevantObservations,
    );
    const principalComponent = isLastPayment ? balance : 0;
    const totalAmount = interest + principalComponent;
    balance -= principalComponent;

    payments.push({
      paymentDate: toDateStr(paymentDate),
      paymentType: isLastPayment ? "Principal + Interest" : "Interest",
      principalComponent,
      interestComponent: interest,
      totalAmount,
      remainingBalance: balance,
      primeRateRange,
    });

    periodStartDate.setTime(paymentDate.getTime() + MILLIS_IN_DAY);
    currentMonth.setMonth(currentMonth.getMonth() + 1);
  }

  return payments;
}

function getPaymentDate(currentMonth: Date, isLastPayment: boolean, end: Date, workDaysPayments: WorkDaysPaymentType): Date {
  const paymentDate = isLastPayment ? end : lastDayOfMonth(currentMonth.getFullYear(), currentMonth.getMonth());
  
  if (workDaysPayments === WorkDaysPaymentType.ALLOWED) {
    return paymentDate;
  }

  // Check if the payment date is a weekend
  if (paymentDate.getDay() === 0 || paymentDate.getDay() === 6) {

    if (workDaysPayments === WorkDaysPaymentType.NEXT_DAY) {
      let daysMove: number = paymentDate.getDay() === 0 ? 1 : 2;
      paymentDate.setTime(paymentDate.getTime() + daysMove * MILLIS_IN_DAY);
    }

    if (workDaysPayments === WorkDaysPaymentType.PREVIOUS_DAY) {
      let daysMove: number = paymentDate.getDay() === 0 ? 2 : 1;
      paymentDate.setTime(paymentDate.getTime() - daysMove * MILLIS_IN_DAY);
    }
  }
  console.log("paymentDate: ", paymentDate.toISOString());
  return paymentDate;
}

function getRelevantRatesForPayment(
  lastEffectiveRate: number,
  startDate: string,
  endDate: string,
  observations: PrimeRateObservation[],
): { initialRatePercent: number; relevantObservations: PrimeRateObservation[] } {

  return { initialRatePercent: lastEffectiveRate, relevantObservations: observations.filter(
    (o) => o.date > startDate && o.date <= endDate
  ) };
}

/** Interest and prime range for one period. Returns interest and a label from min/max rates in the period. */
function interestAndPrimeRangeForMonth(
  principal: number,
  periodStart: Date,
  periodEnd: Date,
  initialPercent: number,
  observations: PrimeRateObservation[],
): { interest: number; primeRateRange: string } {
  const isFullMonth = periodEnd.getMonth() === periodStart.getMonth() && periodStart.getDate() === 1 && periodEnd.getDate() === lastDayOfMonth(periodEnd.getFullYear(), periodEnd.getMonth()).getDate();
  console.log("isFullMonth: ", isFullMonth);
  
  const daysInPeriod = Math.floor((periodEnd.getTime() - periodStart.getTime()) / MILLIS_IN_DAY + 1);
  console.log("daysInPeriod: ", daysInPeriod);
  
  // No changes during that month - use fixed rate.
  if (observations.length === 0) {
    const effectiveDays = Math.floor((periodEnd.getTime() - periodStart.getTime()) / MILLIS_IN_DAY) + 1;
    console.log("effectiveDays: ", effectiveDays);
    return { interest: calculateInterest(principal, initialPercent, daysInPeriod, effectiveDays, isFullMonth), primeRateRange: `${initialPercent.toFixed(2)}%` };
  }

  // Calculate interest for changing rate.
  let interestSum: number = 0;
  let minRate: number = initialPercent;
  let maxRate: number = initialPercent;
  let currentRate: number = initialPercent;
  let latestPeriodStartDate: Date = periodStart;

  for (let i = 0; i < observations.length; i++) {
    const observation = observations[i];
    const changeDate = new Date(observation.date);
    const effectiveDays = Math.floor(changeDate.getTime() - latestPeriodStartDate.getTime() + 1 * MILLIS_IN_DAY);
    latestPeriodStartDate.setTime(changeDate.getTime() + 1 * MILLIS_IN_DAY);
    console.log("effectiveDays: ", effectiveDays);
    interestSum += calculateInterest(principal, currentRate, daysInPeriod, effectiveDays, isFullMonth);
    currentRate = observation.value;

    if (currentRate < minRate) minRate = currentRate;
    if (currentRate > maxRate) maxRate = currentRate;
  }
 
  // Add latest section's interest
  interestSum += calculateInterest(principal, currentRate, daysInPeriod, Math.floor(periodEnd.getTime() - latestPeriodStartDate.getTime() + 1 * MILLIS_IN_DAY), isFullMonth);
  
  return { interest: interestSum, primeRateRange: `${minRate.toFixed(2)}% - ${maxRate.toFixed(2)}%` };
}

function calculateInterest(
  principal: number,
  rate: number,
  daysInMonth: number,
  effectiveDays: number,
  isFullMonth: boolean,
): number {
  if (isFullMonth) {
    const monthlyRate = rate / 100 / 12;
    return principal * monthlyRate;
  }

  const dailyRate = (effectiveDays / 360) * rate / 100;
  return principal * dailyRate;
}