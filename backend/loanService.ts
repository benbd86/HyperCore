import { AppDataSource } from "./db.js";
import { Loan } from "./entities/Loan.js";
import { Payment } from "./entities/Payment.js";
import { createLoanSchedule } from "./bulletLoan.js";

export interface CreateLoanInput {
  name: string;
  principalAmount: number;
  startDate: string;
  endDate: string;
}

const ERROR_START_AFTER_END = "Start date must be before or equal to end date.";

/**
 * Creates a new loan with the given input, validates start/end dates, computes the schedule via bulletLoan, and persists the loan and its payments.
 */
export async function createLoan(input: CreateLoanInput): Promise<Loan> {
  if (input.startDate > input.endDate) {
    throw new Error(ERROR_START_AFTER_END);
  }

  const { schedule, annualRate } = await createLoanSchedule(
    input.principalAmount,
    input.startDate,
    input.endDate
  );

  const repo = AppDataSource.getRepository(Loan);
  const paymentRepo = AppDataSource.getRepository(Payment);

  const loan = repo.create({
    name: input.name,
    principalAmount: String(input.principalAmount),
    startDate: input.startDate,
    endDate: input.endDate,
    annualRate: String(annualRate),
  });
  await repo.save(loan);

  for (const row of schedule) {
    const payment = paymentRepo.create({
      loanId: loan.id,
      paymentDate: row.paymentDate,
      paymentType: row.paymentType,
      principalComponent: String(row.principalComponent),
      interestComponent: String(row.interestComponent),
      totalAmount: String(row.totalAmount),
      remainingBalance: String(row.remainingBalance),
      primeRateRange: row.primeRateRange,
    });
    await paymentRepo.save(payment);
  }

  return loan;
}

/**
 * Returns a page of loans (newest first) with total count; each loan includes its payments.
 */
export async function getLoansPaginated(
  offset: number,
  limit: number
): Promise<{ loans: Loan[]; total: number }> {
  const repo = AppDataSource.getRepository(Loan);
  const [loans, total] = await repo.findAndCount({
    order: { createdAt: "DESC" },
    skip: offset,
    take: limit,
    relations: ["payments"],
  });
  return { loans, total };
}

/**
 * Fetches a single loan by id with its payments ordered by payment date, or null if not found.
 */
export async function getLoanById(id: string): Promise<Loan | null> {
  const repo = AppDataSource.getRepository(Loan);
  return repo.findOne({
    where: { id },
    relations: ["payments"],
    order: { payments: { paymentDate: "ASC" } },
  });
}

/**
 * Total expected interest for a loan (sum of interest components).
 */
export function totalExpectedInterest(loan: Loan): number {
  if (!loan.payments || loan.payments.length === 0) return 0;
  return loan.payments.reduce(
    (sum: number, p: Payment) => sum + parseFloat(p.interestComponent),
    0
  );
}
