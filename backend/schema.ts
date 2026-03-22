/**
 * GraphQL schema: Loan, Payment, LoansPage, CreateLoanInput; Query (loans, loan, primeRate); Mutation (createLoan).
 */
const typeDefs = `#graphql
  type Loan {
    id: ID!
    name: String!
    loanSource: String!
    principalAmount: Float!
    createdAt: String!
    startDate: String!
    endDate: String!
    annualRate: Float!
    totalExpectedInterest: Float!
    payments: [Payment!]!
  }

  type Payment {
    id: ID!
    loanId: ID!
    paymentDate: String!
    paymentType: String!
    principalComponent: Float!
    interestComponent: Float!
    totalAmount: Float!
    remainingBalance: Float!
    primeRateRange: String
    effectiveDays: Int!
  }

  type LoansPage {
    items: [Loan!]!
    totalCount: Int!
    hasMore: Boolean!
  }

  type Query {
    loans(offset: Int = 0, limit: Int = 10): LoansPage!
    loan(id: ID!): Loan
    primeRate: Float!
  }

  input CreateLoanInput {
    name: String!
    loanSource: String!
    principalAmount: Float!
    startDate: String!
    endDate: String!
  }

  type Mutation {
    createLoan(input: CreateLoanInput!): Loan!
  }
`;
export { typeDefs };
