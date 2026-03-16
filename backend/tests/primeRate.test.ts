import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FRED_PRIME_URL = "https://fred.stlouisfed.org/series/PRIME";

describe("getCurrentPrimeRateAsDecimal", () => {
  let originalFetch: typeof globalThis.fetch;

  beforeAll(() => {
    const fixturePath = path.join(__dirname, "fixtures", "html_prime_example.html");
    const html = readFileSync(fixturePath, "utf-8");
    originalFetch = globalThis.fetch;
    vi.stubGlobal(
      "fetch",
      async (url: string | URL) => {
        if (String(url) === FRED_PRIME_URL) {
          return { text: async () => html, ok: true } as Response;
        }
        return originalFetch(url as RequestInfo);
      }
    );
  });

  afterAll(() => {
    vi.unstubAllGlobals();
  });

  it("returns 0.0675 when FRED page contains 6.75 (mock html_prime_example.html)", async () => {
    const { getCurrentPrimeRateAsDecimal } = await import("../primeRate.js");
    const result = await getCurrentPrimeRateAsDecimal();
    expect(result).toBe(0.0675);
  });
});
