import { useQuery } from "@apollo/client/react";
import { useParams, useNavigate } from "react-router-dom";
import { LOAN_DETAIL, PRIME_RATE } from "../graphql/queries";
import {
  PageTitle,
  BackButton,
  TableWrap,
  Table,
  Th,
  Td,
  ScheduleSection,
  MetaBlock,
  LoadingText,
  ErrorText,
} from "../components/LoanDetailPage.styles";

/** Page that shows a single loan's details and payment schedule (uses route param :id). */
export function LoanDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: primeData } = useQuery<{ primeRate: number }>(PRIME_RATE);
  const { data, loading, error } = useQuery<{
    loan: {
      id: string;
      name: string;
      loanSource: string;
      principalAmount: number;
      createdAt: string;
      startDate: string;
      endDate: string;
      annualRate: number;
      totalExpectedInterest: number;
      payments: Array<{
        id: string;
        paymentDate: string;
        paymentType: string;
        principalComponent: number;
        interestComponent: number;
        totalAmount: number;
        remainingBalance: number;
        primeRateRange: string | null;
        effectiveDays: number;
      }>;
    };
  }>(LOAN_DETAIL, {
    variables: { id: id ?? "" },
    skip: !id,
  });

  const loan = data?.loan;

  if (error) {
    return (
      <div>
        <BackButton onClick={() => navigate("/loans")}>← Back</BackButton>
        <PageTitle>Loan</PageTitle>
        <ErrorText>Error: {error.message}</ErrorText>
      </div>
    );
  }

  if (loading || !loan) {
    return (
      <div>
        <BackButton onClick={() => navigate("/loans")}>← Back</BackButton>
        <PageTitle>Loan</PageTitle>
        <LoadingText>Loading…</LoadingText>
      </div>
    );
  }

  const payments = loan.payments ?? [];

  return (
    <div>
      <BackButton onClick={() => navigate("/loans")}>← Back</BackButton>
      <PageTitle>{loan.name}</PageTitle>
      <MetaBlock>
        <p>
          Loan source: {loan.loanSource} · Principal:{" "}
          {formatCurrency(loan.principalAmount)}
        </p>
        <p>
          Created: {loan.createdAt} · Start: {loan.startDate} · End:{" "}
          {loan.endDate}
        </p>
        <p>
          Loan rate (at creation): {(loan.annualRate * 100).toFixed(2)}%
          {primeData?.primeRate != null && (
            <> · Current prime rate: {(primeData.primeRate * 100).toFixed(2)}%</>
          )}
        </p>
      </MetaBlock>

      <ScheduleSection>
        <h2>Repayment schedule</h2>
        {payments.length === 0 ? (
          <p>No payments in schedule.</p>
        ) : (
          <TableWrap>
            <Table>
              <thead>
                <tr>
                  <Th>Payment date</Th>
                  <Th>Payment type</Th>
                  <Th>Prime rate range</Th>
                  <Th>Principal</Th>
                  <Th>Interest</Th>
                  <Th>Total</Th>
                  <Th>Remaining balance</Th>
                  <Th>Effective days</Th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p: {
                  id: string;
                  paymentDate: string;
                  paymentType: string;
                  principalComponent: number;
                  interestComponent: number;
                  totalAmount: number;
                  remainingBalance: number;
                  primeRateRange: string | null;
                  effectiveDays: number;
                }) => (
                  <tr key={p.id}>
                    <Td>{p.paymentDate}</Td>
                    <Td>{p.paymentType}</Td>
                    <Td>{p.primeRateRange ?? "—"}</Td>
                    <Td>{formatCurrency(p.principalComponent)}</Td>
                    <Td>{formatCurrency(p.interestComponent)}</Td>
                    <Td>{formatCurrency(p.totalAmount)}</Td>
                    <Td>{formatCurrency(p.remainingBalance)}</Td>
                    <Td>{p.effectiveDays}</Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </TableWrap>
        )}
      </ScheduleSection>
    </div>
  );
}

function formatCurrency(n: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
}
