/**
 * Integration tests per documents/test_requirement.txt
 * 1. Loan started and ended in the past – interest follows prime over that period
 * 2. Started in the past, ends in the future – past uses prime history, future uses latest prime
 * 3. Starts and ends in the future – all payments use current prime
 * 4. Start/end day-of-month: first day, last day, mid-month
 */
import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import { initDb } from "../db.js";
import { createLoan, getLoanById } from "../loanService.js";

const FRED_PRIME_URL = "https://fred.stlouisfed.org/series/PRIME";
const FRED_PRIME_DATA_URL = "https://fred.stlouisfed.org/data/PRIME.txt";

/** FRED data page HTML: DATE | VALUE table for 2025 prime changes. */
const PRIME_DATA_PAGE_HTML = `<!DOCTYPE html><html><body><table><tbody>
<tr><td>2024-12-20</td><td>7.50</td></tr>
<tr><td>2025-09-17</td><td>7.25</td></tr>
<tr><td>2025-10-30</td><td>7.00</td></tr>
<tr><td>2025-12-11</td><td>6.75</td></tr>
</tbody></table></body></html>`;

const HTML_CURRENT_PRIME_675 = `
<!DOCTYPE html><html><body>
<span class="series-meta-observation-value">6.75</span>
</body></html>
`;

describe("createLoan integration", () => {
  let originalFetch: typeof globalThis.fetch;

  beforeAll(async () => {
    await initDb();
    originalFetch = globalThis.fetch;
    vi.stubGlobal("fetch", async (input: string | URL) => {
      const url = String(input);
      if (url === FRED_PRIME_URL) {
        return { text: async () => HTML_CURRENT_PRIME_675, ok: true } as Response;
      }
      if (url === FRED_PRIME_DATA_URL) {
        return { text: async () => PRIME_DATA_PAGE_HTML, ok: true } as Response;
      }
      return originalFetch(input as RequestInfo);
    });
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-15T12:00:00Z"));
  });

  afterAll(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("throws when start date is later than end date", async () => {
    await expect(
      createLoan({
        name: "Invalid",
        principalAmount: 1000,
        startDate: "2026-06-01",
        endDate: "2026-01-01",
      })
    ).rejects.toThrow("Start date must be before or equal to end date.");
  });

  it("1. started and ended in the past – interest follows prime over that period", async () => {
    const loan = await createLoan({
      name: "Integration test 1M",
      principalAmount: 1_000_000,
      startDate: "2025-01-01",
      endDate: "2026-01-01",
    });

    expect(loan).toBeDefined();
    expect(loan.principalAmount).toBe("1000000");
    expect(loan.startDate).toBe("2025-01-01");
    expect(loan.endDate).toBe("2026-01-01");

    const full = await getLoanById(loan.id);
    expect(full?.payments).toBeDefined();
    const payments = full!.payments!.sort(
      (a, b) => a.paymentDate.localeCompare(b.paymentDate)
    );

    const toNum = (s: string) => parseFloat(s);
    const round2 = (n: number) => Math.round(n * 100) / 100;

    // Jan–Aug: full month at 7.5% => 1M * 7.5%/12 = 6250
    const fullMonth75 = 6_250;
    for (const p of payments.filter(
      (p) =>
        p.paymentDate <= "2025-08-31" &&
        p.paymentType === "Interest"
    )) {
      expect(round2(toNum(p.interestComponent))).toBe(fullMonth75);
      expect(p.primeRateRange).toBe("7.50%");
    }

    // Sept: matches bulletLoan `calculateInterest` — 17 days 7.5% + 13 days 7.25% (calendar days in Sept)
    const septInterest =
      (1_000_000 * (7.5 / 100 / 12) * (17 / 30)) +
      (1_000_000 * (7.25 / 100 / 12) * (13 / 30));
    const septPayment = payments.find((p) => p.paymentDate === "2025-09-30");
    expect(septPayment).toBeDefined();
    expect(round2(toNum(septPayment!.interestComponent))).toBe(round2(septInterest));
    expect(septPayment!.primeRateRange).toContain("7.25");
    expect(septPayment!.primeRateRange).toContain("7.50");

    // Oct: 30 days 7.25% + 1 day 7% (change on 30th; prorated by calendar days in October)
    const octInterest =
      (1_000_000 * (7.25 / 100 / 12) * (30 / 31)) +
      (1_000_000 * (7 / 100 / 12) * (1 / 31));
    const octPayment = payments.find((p) => p.paymentDate === "2025-10-31");
    expect(octPayment).toBeDefined();
    expect(round2(toNum(octPayment!.interestComponent))).toBe(round2(octInterest));
    expect(octPayment!.primeRateRange).toContain("7.00");
    expect(octPayment!.primeRateRange).toContain("7.25");

    // Nov: full month 7%
    const novPayment = payments.find((p) => p.paymentDate === "2025-11-30");
    expect(novPayment).toBeDefined();
    expect(round2(toNum(novPayment!.interestComponent))).toBe(5833.33);
    expect(novPayment!.primeRateRange).toBe("7.00%");

    // Dec: 11 days 7% + 20 days 6.75% (change on 11th; prorated by calendar days in December)
    const decInterest =
      (1_000_000 * (7 / 100 / 12) * (11 / 31)) +
      (1_000_000 * (6.75 / 100 / 12) * (20 / 31));
    const decPayment = payments.find((p) => p.paymentDate === "2025-12-31");
    expect(decPayment).toBeDefined();
    expect(round2(toNum(decPayment!.interestComponent))).toBe(round2(decInterest));
    expect(decPayment!.primeRateRange).toContain("6.75");
    expect(decPayment!.primeRateRange).toContain("7.00");

    // Final: 2026-01-01 (principal + interest). Period Dec 31–Jan 1 = 1 day at 6.75%.
    const finalPayment = payments.find((p) => p.paymentDate === "2026-01-01");
    expect(finalPayment).toBeDefined();
    expect(finalPayment!.paymentType).toBe("Principal + Interest");
    expect(round2(toNum(finalPayment!.principalComponent))).toBe(1_000_000);
    expect(round2(toNum(finalPayment!.remainingBalance))).toBe(0);
    const finalDayInterest = (1_000_000 * (6.75 / 100 / 12) * (1 / 31));
    expect(round2(toNum(finalPayment!.interestComponent))).toBe(round2(finalDayInterest));
    expect(round2(toNum(finalPayment!.totalAmount))).toBe(1_000_000 + round2(finalDayInterest));
  });

  it("2. started in the past, ends in the future – past uses prime history, future uses latest prime", async () => {
    const loan = await createLoan({
      name: "Past to future",
      principalAmount: 500_000,
      startDate: "2025-01-01",
      endDate: "2026-06-30",
    });
    expect(loan).toBeDefined();
    const full = await getLoanById(loan.id);
    const payments = full!.payments!.sort((a, b) => a.paymentDate.localeCompare(b.paymentDate));
    const round2 = (n: number) => Math.round(n * 100) / 100;
    const toNum = (s: string) => parseFloat(s);
    // Past: Sept 2025 has split rate (7.5% / 7.25%)
    const septPayment = payments.find((p) => p.paymentDate === "2025-09-30");
    expect(septPayment).toBeDefined();
    expect(septPayment!.primeRateRange).toContain("7.25");
    expect(septPayment!.primeRateRange).toContain("7.50");
    // Future: Feb 2026 uses current prime only (6.75%)
    const febFuture = payments.find((p) => p.paymentDate === "2026-02-28");
    expect(febFuture).toBeDefined();
    expect(febFuture!.primeRateRange).toBe("6.75%");
    const expectedFebInterest = (500_000 * (6.75 / 12)) / 100;
    expect(round2(toNum(febFuture!.interestComponent))).toBe(round2(expectedFebInterest));
  });

  it("3. starts and ends in the future – all payments use current prime", async () => {
    const loan = await createLoan({
      name: "All future",
      principalAmount: 100_000,
      startDate: "2026-06-01",
      endDate: "2027-06-01",
    });
    expect(loan).toBeDefined();
    const full = await getLoanById(loan.id);
    const payments = full!.payments!.sort((a, b) => a.paymentDate.localeCompare(b.paymentDate));
    expect(payments.length).toBeGreaterThan(0);
    const interestPayments = payments.filter((p) => p.paymentType === "Interest");
    for (const p of interestPayments) {
      expect(p.primeRateRange).toBe("6.75%");
    }
    const finalPayment = payments.find((p) => p.paymentType === "Principal + Interest");
    expect(finalPayment).toBeDefined();
    expect(finalPayment!.paymentDate).toBe("2027-06-01");
  });

  it("4a. start/end on first day of month", async () => {
    const loan = await createLoan({
      name: "First day",
      principalAmount: 10_000,
      startDate: "2025-01-01",
      endDate: "2025-12-01",
    });
    const full = await getLoanById(loan.id);
    const payments = full!.payments!.sort((a, b) => a.paymentDate.localeCompare(b.paymentDate));
    const finalPayment = payments[payments.length - 1];
    expect(finalPayment.paymentDate).toBe("2025-12-01");
    expect(finalPayment.paymentType).toBe("Principal + Interest");
    expect(parseFloat(finalPayment.remainingBalance)).toBe(0);
  });

  it("4b. start/end on last day of month", async () => {
    const loan = await createLoan({
      name: "Last day",
      principalAmount: 10_000,
      startDate: "2025-01-31",
      endDate: "2025-12-31",
    });
    const full = await getLoanById(loan.id);
    const payments = full!.payments!.sort((a, b) => a.paymentDate.localeCompare(b.paymentDate));
    expect(payments[0].paymentDate).toBe("2025-01-31");
    const finalPayment = payments[payments.length - 1];
    expect(finalPayment.paymentDate).toBe("2025-12-31");
    expect(finalPayment.paymentType).toBe("Principal + Interest");
  });

  it("4c. start/end on mid-month (random day)", async () => {
    const loan = await createLoan({
      name: "Mid month",
      principalAmount: 10_000,
      startDate: "2025-01-15",
      endDate: "2025-12-15",
    });
    const full = await getLoanById(loan.id);
    const payments = full!.payments!.sort((a, b) => a.paymentDate.localeCompare(b.paymentDate));
    // First period is partial: Jan 15 – Jan 31
    expect(payments[0].paymentDate).toBe("2025-01-31");
    const finalPayment = payments[payments.length - 1];
    expect(finalPayment.paymentDate).toBe("2025-12-15");
    expect(finalPayment.paymentType).toBe("Principal + Interest");
  });
});
