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
      principalAmount: number;
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
        <p style={{ color: "#c00" }}>Error: {error.message}</p>
      </div>
    );
  }

  if (loading || !loan) {
    return (
      <div>
        <BackButton onClick={() => navigate("/loans")}>← Back</BackButton>
        <PageTitle>Loan</PageTitle>
        <p>Loading…</p>
      </div>
    );
  }

  const payments = loan.payments ?? [];

  return (
    <div>
      <BackButton onClick={() => navigate("/loans")}>← Back</BackButton>
      <PageTitle>{loan.name}</PageTitle>
      <p>
        Principal: {formatCurrency(loan.principalAmount)} · Start: {loan.startDate} · End: {loan.endDate} · Loan rate (at creation): {(loan.annualRate * 100).toFixed(2)}%
        {primeData?.primeRate != null && (
          <> · Current prime rate: {(primeData.primeRate * 100).toFixed(2)}%</>
        )}
      </p>

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
                }) => (
                  <tr key={p.id}>
                    <Td>{p.paymentDate}</Td>
                    <Td>{p.paymentType}</Td>
                    <Td>{p.primeRateRange ?? "—"}</Td>
                    <Td>{formatCurrency(p.principalComponent)}</Td>
                    <Td>{formatCurrency(p.interestComponent)}</Td>
                    <Td>{formatCurrency(p.totalAmount)}</Td>
                    <Td>{formatCurrency(p.remainingBalance)}</Td>
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
