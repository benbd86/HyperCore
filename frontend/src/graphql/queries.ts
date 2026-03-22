import { gql } from "@apollo/client";

/** GraphQL documents: LOANS_PAGE, LOAN_DETAIL, PRIME_RATE (queries), CREATE_LOAN (mutation). */
export const LOANS_PAGE = gql`
  query LoansPage($offset: Int, $limit: Int) {
    loans(offset: $offset, limit: $limit) {
      items {
        id
        name
        loanSource
        principalAmount
        createdAt
        startDate
        endDate
        totalExpectedInterest
      }
      totalCount
      hasMore
    }
  }
`;

export const LOAN_DETAIL = gql`
  query LoanDetail($id: ID!) {
    loan(id: $id) {
      id
      name
      loanSource
      principalAmount
      createdAt
      startDate
      endDate
      annualRate
      totalExpectedInterest
      payments {
        id
        paymentDate
        paymentType
        principalComponent
        interestComponent
        totalAmount
        remainingBalance
        primeRateRange
        effectiveDays
      }
    }
  }
`;

export const PRIME_RATE = gql`
  query PrimeRate {
    primeRate
  }
`;

export const CREATE_LOAN = gql`
  mutation CreateLoan($input: CreateLoanInput!) {
    createLoan(input: $input) {
      id
      name
      loanSource
      principalAmount
      startDate
      endDate
      totalExpectedInterest
    }
  }
`;
