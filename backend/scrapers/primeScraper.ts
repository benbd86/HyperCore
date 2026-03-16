import * as cheerio from "cheerio";

/** FRED series page for Bank Prime Loan Rate (PRIME) – used for latest value. */
const FRED_PRIME_URL = "https://fred.stlouisfed.org/series/PRIME";

/** FRED data page for PRIME – contains all dates where the prime has changed. */
const FRED_PRIME_DATA_URL = "https://fred.stlouisfed.org/data/PRIME.txt";

/** Class on the span that contains the latest observation value (e.g. "6.75"). */
const CLASS_SERIES_META_OBSERVATION_VALUE = "series-meta-observation-value";

/** Date format YYYY-MM-DD for comparison. */
const DATE_REG = /^(\d{4}-\d{2}-\d{2})/;

const FETCH_TIMEOUT_MS = 15000;
const ERROR_NO_DATA_BEFORE_START =
  "We don't have data for rates older than the start date so loan cannot be created.";

export interface PrimeRateObservation {
  date: string;
  value: number;
}

export interface PrimeRateForDatesResult {
  /** Prime rate changes in the requested range [startDate, endDate]. */
  observations: PrimeRateObservation[];
  /** Rate (percent, e.g. 7.5) in effect immediately before the first change in range. */
  initialRatePercent: number;
}

/**
 * Returns the latest prime rate known today using FRED_PRIME_URL.
 */
export async function scrapeCurrentPrimeRate(): Promise<number> {
  try {
    const res = await fetch(FRED_PRIME_URL);
    const html = await res.text();
    const $ = cheerio.load(html);
    const rawValue = $(`.${CLASS_SERIES_META_OBSERVATION_VALUE}`).first().text().trim();
    const rate = parseFloat(rawValue);

    if (!Number.isFinite(rate)) {
      throw new Error("Failed to scrape current prime rate, got value: " + rawValue);
    }

    return rate;
  } catch (error) {
    console.error("Failed to scrape current prime rate, got error: " + error);
    throw new Error("Prime rate is not available. Please try again later.");
  }
}

/**
 * Scrapes FRED_PRIME_DATA_URL (all dates where the prime has changed), ordered oldest to newest.
 * Finds the first change in the received date range; the value immediately before that is the
 * initial prime rate. Returns that initial rate and all observations in [startDate, endDate].
 * Throws if there is no observation before the first in-range change (no data for rates older than start).
 */
export async function scrapePrimeRateForDates(
  startDate: string,
  endDate: string
): Promise<PrimeRateForDatesResult> {
  const start = normalizeDate(startDate);
  const end = normalizeDate(endDate);
  if (start > end) {
    throw new Error("startDate must be <= endDate");
  }

  const observations = await fetchObservationsFromDataUrl();
  if (observations.length === 0) {
    throw new Error(ERROR_NO_DATA_BEFORE_START);
  }

  const firstInRangeIdx = observations.findIndex((o) => o.date >= start);
  if (firstInRangeIdx === -1) {
    return {
      observations: [],
      initialRatePercent: observations[observations.length - 1].value,
    };
  }
  if (firstInRangeIdx === 0) {
    throw new Error(ERROR_NO_DATA_BEFORE_START);
  }

  const initialRatePercent = observations[firstInRangeIdx - 1].value;
  const inRange = observations.filter((o) => o.date >= start && o.date <= end);

  return { observations: inRange, initialRatePercent };
}

/** Extracts and validates YYYY-MM-DD from a date string; throws if format is invalid. */
function normalizeDate(s: string): string {
  const m = s.trim().match(DATE_REG);
  if (!m) throw new Error("Invalid date format, use YYYY-MM-DD: " + s);
  return m[1];
}

/**
 * Fetches FRED_PRIME_DATA_URL and parses the full prime rate change list (oldest to newest).
 * The page is HTML with a table of DATE | VALUE rows (see https://fred.stlouisfed.org/data/PRIME.txt).
 */
async function fetchObservationsFromDataUrl(): Promise<PrimeRateObservation[]> {
  const res = await fetch(FRED_PRIME_DATA_URL, { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) });
  const html = await res.text();
  return parseObservationsFromDataPage(html);
}

/**
 * Parses the FRED PRIME data page HTML. The page has table#data-table-observations
 * with DATE (in th scope="row") and VALUE (in td). Extracts all observations (oldest to newest).
 */
function parseObservationsFromDataPage(html: string): PrimeRateObservation[] {
  const $ = cheerio.load(html);
  const observations: PrimeRateObservation[] = [];

  const table = $("#data-table-observations").length
    ? $("#data-table-observations")
    : $("table").first();

  table.find("tbody tr").each((_, row) => {
    const cells = $(row).find("th, td");
    if (cells.length < 2) return;
    const dateStr = $(cells[0]).text().trim();
    const valueStr = $(cells[1]).text().trim().replace(/,/g, "").trim();
    const dateMatch = dateStr.match(DATE_REG);
    if (!dateMatch) return;
    const date = dateMatch[1];
    const value = parseFloat(valueStr);
    if (!Number.isFinite(value)) return;
    observations.push({ date, value });
  });

  return observations.sort((a, b) => a.date.localeCompare(b.date));
}
