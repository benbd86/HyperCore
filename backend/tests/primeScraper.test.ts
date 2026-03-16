/**
 * Scraper tests per documents/test_requirement.txt
 * 1. scrapeCurrentPrimeRate: (a) successful scraping, (b) failed scraping - catch exception
 * 2. scrapePrimeRateForDates using html_prime_full_changes_example.html:
 *    (a) range 1/1/2025–1/1/2026: changes 2025-09-17@7.25%, 2025-10-30@7%, 2025-12-11@6.75%; initial 7.50%
 *    (b) range 1/1/2025–1/1/2027: same values as (a)
 *    (c) range starting before first available prime (before 1955-08-04): fails with no initial prime
 */
import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const FRED_PRIME_URL = "https://fred.stlouisfed.org/series/PRIME";
const FRED_PRIME_DATA_URL = "https://fred.stlouisfed.org/data/PRIME.txt";

const htmlSuccess = readFileSync(
  path.join(__dirname, "fixtures", "html_prime_example.html"),
  "utf-8"
);

const htmlNoRate = `
<!DOCTYPE html><html><body>
  <span class="series-meta-value">2025-12-11:</span>
  <span class="other-class">N/A</span>
</body></html>
`;

const htmlPrimeFullChangesExample = readFileSync(
  path.join(__dirname, "fixtures", "html_prime_full_changes_example.html"),
  "utf-8"
);

const EXPECTED_INITIAL_RATE_PERCENT = 7.5;
const EXPECTED_OBSERVATIONS_2025 = [
  { date: "2025-09-17", value: 7.25 },
  { date: "2025-10-30", value: 7.0 },
  { date: "2025-12-11", value: 6.75 },
];

describe("scrapeCurrentPrimeRate", () => {
  let originalFetch: typeof globalThis.fetch;
  let fetchBehavior: "success" | "fail";

  beforeAll(() => {
    originalFetch = globalThis.fetch;
    vi.stubGlobal("fetch", async (input: string | URL) => {
      const url = String(input);
      if (url.startsWith(FRED_PRIME_URL) && !url.includes("cosd=")) {
        if (fetchBehavior === "success") {
          return { text: async () => htmlSuccess, ok: true } as Response;
        }
        return { text: async () => htmlNoRate, ok: true } as Response;
      }
      return originalFetch(input as RequestInfo);
    });
  });

  afterAll(() => {
    vi.unstubAllGlobals();
  });

  it("1a. successful scraping", async () => {
    fetchBehavior = "success";
    const { scrapeCurrentPrimeRate } = await import("../scrapers/primeScraper.js");
    const result = await scrapeCurrentPrimeRate();
    expect(result).toBe(6.75);
  });

  it("1b. failed scraping - catch the expected exception", async () => {
    fetchBehavior = "fail";
    const { scrapeCurrentPrimeRate } = await import("../scrapers/primeScraper.js");
    await expect(scrapeCurrentPrimeRate()).rejects.toThrow("Prime rate is not available");
  });
});

describe("scrapePrimeRateForDates (html_prime_full_changes_example.html)", () => {
  let originalFetch: typeof globalThis.fetch;

  beforeAll(() => {
    originalFetch = globalThis.fetch;
    vi.stubGlobal("fetch", async (input: string | URL) => {
      const url = String(input);
      if (url === FRED_PRIME_DATA_URL) {
        return { text: async () => htmlPrimeFullChangesExample, ok: true } as Response;
      }
      return originalFetch(input as RequestInfo);
    });
  });

  afterAll(() => {
    vi.unstubAllGlobals();
  });

  it("2a. range 1/1/2025 to 1/1/2026 - verify changes and initial 7.50% (from 2024-12-20)", async () => {
    const { scrapePrimeRateForDates } = await import("../scrapers/primeScraper.js");
    const result = await scrapePrimeRateForDates("2025-01-01", "2026-01-01");
    expect(result.initialRatePercent).toBe(EXPECTED_INITIAL_RATE_PERCENT);
    expect(result.observations).toHaveLength(3);
    expect(result.observations.map((o) => ({ date: o.date, value: o.value }))).toEqual(
      EXPECTED_OBSERVATIONS_2025
    );
  });

  it("2b. range 1/1/2025 to 1/1/2027 - same values as 2a", async () => {
    const { scrapePrimeRateForDates } = await import("../scrapers/primeScraper.js");
    const result = await scrapePrimeRateForDates("2025-01-01", "2027-01-01");
    expect(result.initialRatePercent).toBe(EXPECTED_INITIAL_RATE_PERCENT);
    expect(result.observations.map((o) => ({ date: o.date, value: o.value }))).toEqual(
      EXPECTED_OBSERVATIONS_2025
    );
  });

  it("2c. range starting before first available prime (before 1955-08-04) - fails on no initial prime", async () => {
    const { scrapePrimeRateForDates } = await import("../scrapers/primeScraper.js");
    await expect(scrapePrimeRateForDates("1955-01-01", "1955-12-31")).rejects.toThrow(
      "We don't have data for rates older than the start date so loan cannot be created"
    );
  });
});
