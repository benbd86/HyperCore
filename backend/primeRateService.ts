/**
 * Prime rate for loan creation and date ranges. Fetches the Bank Prime Loan Rate from FRED via scraping.
 */
import {
  scrapeCurrentPrimeRate,
  scrapePrimeRateForDates,
  type PrimeRateForDatesResult,
} from "./scrapers/primeScraper.js";

const PERCENT_TO_DECIMAL = 100;

/**
 * Returns the current prime rate as a decimal (e.g. 0.0675 for 6.75%).
 * Used when creating a new loan and for the GraphQL primeRate query.
 */
export async function getCurrentPrimeRateAsDecimal(): Promise<number> {
  const ratePercent = await scrapeCurrentPrimeRate();
  return ratePercent / PERCENT_TO_DECIMAL;
}

/**
 * Returns prime rate history for a date range: initial rate (percent) and observations in range.
 * Used when creating a loan that started in the past so the schedule uses historical prime rates.
 */
export async function getPrimeRateForDateRange(
  startDate: string,
  endDate: string
): Promise<PrimeRateForDatesResult> {
  return scrapePrimeRateForDates(startDate, endDate);
}
