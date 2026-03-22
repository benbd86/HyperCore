import { describe, it, expect, vi } from "vitest";

vi.mock("../primeRate.js", () => ({
  getCurrentPrimeRateAsDecimal: () => Promise.resolve(0.0675),
  getPrimeRateForDateRange: () =>
    Promise.resolve({ initialRatePercent: 6.75, observations: [] }),
}));

import { createLoanSchedule } from "../bulletLoan.js";

describe("createLoanSchedule (single rate)", () => {
  const annualRate = 0.0675; // 6.75%
  const principal = 100_000;

  // StartDate: first day | EndDate: last day | Same month: false | Period: full year
  it("start first day, end last day, different months, full year", async () => {
    const rows = await createLoanSchedule(
      principal,
      "2025-01-01",
      "2025-12-31"
    );
    expect(rows.length).toBeGreaterThan(1);
    const last = rows[rows.length - 1];
    expect(last.paymentDate).toBe("2025-12-31");
    expect(last.paymentType).toBe("Principal + Interest");
    expect(last.remainingBalance).toBe(0);
    const sumPrincipal = rows.reduce((s, r) => s + r.principalComponent, 0);
    expect(sumPrincipal).toBeCloseTo(principal, 2);
  });

  // StartDate: first day | EndDate: last day | Same month: false | Period: full few years
  it("start first day, end last day, different months, full few years", async () => {
    const rows = await createLoanSchedule(
      principal,
      "2025-01-01",
      "2026-12-31"
    );
    expect(rows.length).toBeGreaterThan(12);
    const last = rows[rows.length - 1];
    expect(last.paymentDate).toBe("2026-12-31");
    expect(last.remainingBalance).toBe(0);
  });

  // StartDate: first day | EndDate: last day | Same month: false | Period: few months less than a year
  it("start first day, end last day, different months, few months less than a year", async () => {
    const rows = await createLoanSchedule(
      principal,
      "2025-01-01",
      "2025-08-31"
    );
    const last = rows[rows.length - 1];
    expect(last.paymentDate).toBe("2025-08-31");
    expect(last.remainingBalance).toBe(0);
    expect(rows.length).toBeLessThan(12);
  });

  // StartDate: first day | EndDate: last day | Same month: false | Period: few months longer than a year
  it("start first day, end last day, different months, few months longer than a year", async () => {
    const rows = await createLoanSchedule(
      principal,
      "2025-01-01",
      "2026-03-31"
    );
    const last = rows[rows.length - 1];
    expect(last.paymentDate).toBe("2026-03-31");
    expect(last.remainingBalance).toBe(0);
    expect(rows.length).toBeGreaterThan(12);
  });

  // StartDate: first day | EndDate: first day | Same month: false | Period: few months
  it("start first day, end first day next month", async () => {
    const rows = await createLoanSchedule(
      principal,
      "2025-01-01",
      "2025-04-01"
    );
    const last = rows[rows.length - 1];
    expect(last.paymentDate).toBe("2025-04-01");
    expect(last.paymentType).toBe("Principal + Interest");
    expect(last.remainingBalance).toBe(0);
  });

  // StartDate: first day | EndDate: random day | Same month: false | Period: few months
  it("start first day, end random day (not month-end)", async () => {
    const rows = await createLoanSchedule(
      principal,
      "2025-01-01",
      "2025-06-15"
    );
    const last = rows[rows.length - 1];
    expect(last.paymentDate).toBe("2025-06-15");
    expect(last.paymentType).toBe("Principal + Interest");
    expect(last.remainingBalance).toBe(0);
  });

  // StartDate: last day (day 31) | EndDate: last day (day 31) | Same month: true
  it("start last day (31), end last day (31), same month", async () => {
    const rows = await createLoanSchedule(
      principal,
      "2025-01-31",
      "2025-01-31"
    );
    expect(rows).toHaveLength(1);
    expect(rows[0].paymentDate).toBe("2025-01-31");
    expect(rows[0].paymentType).toBe("Principal + Interest");
    expect(rows[0].remainingBalance).toBe(0);
  });

  // Start date last day of month: first period is Jan 31–Jan 31 (one calendar day in January)
  it("first payment when start is last day of month accrues one day of interest", async () => {
    const rows = await createLoanSchedule(
      principal,
      "2025-01-31",
      "2025-03-31"
    );
    const firstRow = rows[0];
    expect(firstRow.paymentDate).toBe("2025-01-31");
    expect(firstRow.paymentType).toBe("Interest");
    const oneDayJanInterest = principal * (annualRate / 12) * (1 / 31);
    expect(firstRow.interestComponent).toBeCloseTo(oneDayJanInterest, 5);
    expect(firstRow.principalComponent).toBe(0);
    // Second payment (Feb) is a full month: full interest
    const secondRow = rows[1];
    expect(secondRow.paymentDate).toBe("2025-02-28");
    const fullMonthInterest = principal * (annualRate / 12);
    expect(secondRow.interestComponent).toBeCloseTo(fullMonthInterest, 2);
  });

  // StartDate: last day (day 28, not >30) | EndDate: last day (28) | Same month: true
  it("start last day (28 Feb), end last day (28), same month", async () => {
    const rows = await createLoanSchedule(
      principal,
      "2025-02-28",
      "2025-02-28"
    );
    expect(rows).toHaveLength(1);
    expect(rows[0].paymentDate).toBe("2025-02-28");
    expect(rows[0].remainingBalance).toBe(0);
  });

  // StartDate: last day (31) | EndDate: last day (30) | Same month: false | Period: full year
  it("start last day (31 Jan), end last day (30 Dec), different months, full year", async () => {
    const rows = await createLoanSchedule(
      principal,
      "2025-01-31",
      "2025-12-31"
    );
    const last = rows[rows.length - 1];
    expect(last.paymentDate).toBe("2025-12-31");
    expect(last.remainingBalance).toBe(0);
  });

  // StartDate: last day (31) | EndDate: last day (31) | Same month: false | Period: few months
  it("start last day (31), end last day (31), different months, few months", async () => {
    const rows = await createLoanSchedule(
      principal,
      "2025-01-31",
      "2025-03-31"
    );
    const interestOnly = rows.filter((r) => r.paymentType === "Interest");
    const principalPlusInterest = rows.filter((r) => r.paymentType === "Principal + Interest");
    expect(principalPlusInterest).toHaveLength(1);
    expect(principalPlusInterest[0].paymentDate).toBe("2025-03-31");
    expect(interestOnly.length).toBeGreaterThanOrEqual(1);
  });

  // StartDate: random day | EndDate: last day | Same month: true
  it("start random day, end last day, same month", async () => {
    const rows = await createLoanSchedule(
      principal,
      "2025-01-15",
      "2025-01-31"
    );
    expect(rows).toHaveLength(1);
    expect(rows[0].paymentDate).toBe("2025-01-31");
    expect(rows[0].paymentType).toBe("Principal + Interest");
    expect(rows[0].remainingBalance).toBe(0);
  });

  // StartDate: random day | EndDate: random day | Same month: true (end not month-end)
  it("start random day, end random day, same month (final payment on end date)", async () => {
    const rows = await createLoanSchedule(
      principal,
      "2025-01-15",
      "2025-01-25"
    );
    const last = rows[rows.length - 1];
    expect(last.paymentDate).toBe("2025-01-25");
    expect(last.paymentType).toBe("Principal + Interest");
    expect(last.remainingBalance).toBe(0);
  });

  // StartDate: first day | EndDate: last day | Same month: true
  it("start first day, end last day, same month", async () => {
    const rows = await createLoanSchedule(
      principal,
      "2025-01-01",
      "2025-01-31"
    );
    expect(rows).toHaveLength(1);
    expect(rows[0].paymentDate).toBe("2025-01-31");
    expect(rows[0].remainingBalance).toBe(0);
  });

  // StartDate: random day | EndDate: first day | Same month: false
  it("start random day, end first day next month", async () => {
    const rows = await createLoanSchedule(
      principal,
      "2025-01-15",
      "2025-02-01"
    );
    const last = rows[rows.length - 1];
    expect(last.paymentDate).toBe("2025-02-01");
    expect(last.paymentType).toBe("Principal + Interest");
    expect(last.remainingBalance).toBe(0);
  });

  // StartDate: last day (31) | EndDate: random day | Same month: false
  it("start last day (31), end random day, different months", async () => {
    const rows = await createLoanSchedule(
      principal,
      "2025-01-31",
      "2025-05-15"
    );
    const last = rows[rows.length - 1];
    expect(last.paymentDate).toBe("2025-05-15");
    expect(last.remainingBalance).toBe(0);
  });

  // StartDate: random day | EndDate: last day | Same month: false | Period: full year
  it("start random day, end last day, different months, full year", async () => {
    const rows = await createLoanSchedule(
      principal,
      "2025-01-15",
      "2025-12-31"
    );
    const last = rows[rows.length - 1];
    expect(last.paymentDate).toBe("2025-12-31");
    expect(last.remainingBalance).toBe(0);
    const sumPrincipal = rows.reduce((s, r) => s + r.principalComponent, 0);
    expect(sumPrincipal).toBeCloseTo(principal, 2);
  });

  // Payment dates ascending; sum principal = initial principal; last remaining balance zero
  it("payment dates ascending and principal conserved", async () => {
    const rows = await createLoanSchedule(
      75_000,
      "2025-01-10",
      "2025-12-31"
    );
    for (let i = 1; i < rows.length; i++) {
      const prev = new Date(rows[i - 1].paymentDate).getTime();
      const curr = new Date(rows[i].paymentDate).getTime();
      expect(curr).toBeGreaterThanOrEqual(prev);
    }
    const sumPrincipal = rows.reduce((s, r) => s + r.principalComponent, 0);
    expect(sumPrincipal).toBeCloseTo(75_000, 2);
    expect(rows[rows.length - 1].remainingBalance).toBe(0);
  });

  // 30/360: full month interest = principal * (annualRate/12)
  it("30/360 full month interest equals principal * (annualRate/12)", async () => {
    const rows = await createLoanSchedule(
      principal,
      "2025-01-01",
      "2025-04-30"
    );
    const fullMonthInterest = principal * (annualRate / 12);
    const interestOnlyRows = rows.filter((r) => r.paymentType === "Interest");
    interestOnlyRows.forEach((row) => {
      expect(row.interestComponent).toBeCloseTo(fullMonthInterest, 2);
    });
  });
});
