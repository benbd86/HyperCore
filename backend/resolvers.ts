import { Loan } from "./entities/Loan.js";
import {
  getLoansPaginated,
  getLoanById,
  createLoan as createLoanService,
  totalExpectedInterest,
} from "./loanService.js";
import { getCurrentPrimeRateAsDecimal } from "./primeRateService.js";

/**
 * GraphQL resolvers: Query (loans, loan, primeRate), Mutation (createLoan), and field resolvers for Loan and Payment.
 */
export const resolvers = {
  Query: {
    /** Returns a paginated list of loans (items, totalCount, hasMore). */
    loans: async (
      _: unknown,
      { offset = 0, limit = 10 }: { offset?: number; limit?: number }
    ) => {
      const cappedLimit = Math.min(Math.max(limit, 1), 100);
      const { loans, total } = await getLoansPaginated(offset, cappedLimit);
      return {
        items: loans,
        totalCount: total,
        hasMore: offset + loans.length < total,
      };
    },
    loan: async (_: unknown, { id }: { id: string }) => {
      return getLoanById(id);
    },
    primeRate: async () => {
      return getCurrentPrimeRateAsDecimal();
    },
  },
  Mutation: {
    createLoan: async (
      _: unknown,
      { input }: { input: { name: string; principalAmount: number; startDate: string; endDate: string } }
    ) => {
      return createLoanService(input);
    },
  },
  Loan: {
    principalAmount: (parent: Loan) => parseFloat(parent.principalAmount),
    annualRate: (parent: Loan) => parseFloat(parent.annualRate),
    totalExpectedInterest: (parent: Loan) => totalExpectedInterest(parent),
    payments: (parent: Loan) => {
      if (!parent.payments) return [];
      return [...parent.payments].sort(
        (a, b) =>
          new Date(a.paymentDate).getTime() - new Date(b.paymentDate).getTime()
      );
    },
  },
  Payment: {
    /** Converts stored string to number for GraphQL Float. */
    principalComponent: (parent: { principalComponent: string }) =>
      parseFloat(parent.principalComponent),
    /** Converts stored string to number for GraphQL Float. */
    interestComponent: (parent: { interestComponent: string }) =>
      parseFloat(parent.interestComponent),
    /** Converts stored string to number for GraphQL Float. */
    totalAmount: (parent: { totalAmount: string }) =>
      parseFloat(parent.totalAmount),
    /** Converts stored string to number for GraphQL Float. */
    remainingBalance: (parent: { remainingBalance: string }) =>
      parseFloat(parent.remainingBalance),
  },
};
