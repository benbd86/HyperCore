import { gql } from "@apollo/client";

export const LOANS_PAGE = gql`
  query LoansPage($offset: Int, $limit: Int) {
    loans(offset: $offset, limit: $limit) {
      items {
        id
        name
        principalAmount
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
      principalAmount
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
      }
    }
  }
`;

export const CREATE_LOAN = gql`
  mutation CreateLoan($input: CreateLoanInput!) {
    createLoan(input: $input) {
      id
      name
      principalAmount
      startDate
      endDate
      totalExpectedInterest
    }
  }
`;
