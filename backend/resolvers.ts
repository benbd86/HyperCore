import { Loan } from "./entities/Loan.js";
import {
  getLoansPaginated,
  getLoanById,
  createLoan as createLoanService,
  totalExpectedInterest,
} from "./loanService.js";

export const resolvers = {
  Query: {
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
    principalComponent: (parent: { principalComponent: string }) =>
      parseFloat(parent.principalComponent),
    interestComponent: (parent: { interestComponent: string }) =>
      parseFloat(parent.interestComponent),
    totalAmount: (parent: { totalAmount: string }) =>
      parseFloat(parent.totalAmount),
    remainingBalance: (parent: { remainingBalance: string }) =>
      parseFloat(parent.remainingBalance),
  },
};
