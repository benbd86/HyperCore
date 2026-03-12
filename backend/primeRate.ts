/**
 * Prime rate for loan creation.
 * Currently returns a fixed rate of 6.75% (as decimal 0.0675).
 * TODO: Implement FRED API or scraping to fetch the Daily Prime Rate.
 */

/** Fixed annual prime rate in percent (e.g. 6.75 = 6.75%). */
const FIXED_PRIME_RATE_PERCENT = 6.75;

/**
 * Returns the current prime rate as a decimal (e.g. 0.0675 for 6.75%).
 * Used when creating a new loan.
 */
export async function getCurrentPrimeRateAsDecimal(): Promise<number> {
  return FIXED_PRIME_RATE_PERCENT / 100;
}
