import { useQuery } from "@apollo/client/react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { LOANS_PAGE } from "../graphql/queries";
import {
  PageTitle,
  TableWrap,
  Table,
  Th,
  Td,
  RowLink,
  Button,
  PaginationWrap,
  EmptyState,
} from "../components/LoansPage.styles";
import { NewLoanModal } from "../components/NewLoanModal";

const PAGE_SIZE = 10;

export function LoansPage() {
  const navigate = useNavigate();
  const [offset, setOffset] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);

  const { data, loading, error, refetch } = useQuery<{
    loans: {
      items: Array<{
        id: string;
        name: string;
        principalAmount: number;
        startDate: string;
        endDate: string;
        totalExpectedInterest: number;
        workDaysPayments: number;
      }>;
      totalCount: number;
      hasMore: boolean;
    };
  }>(LOANS_PAGE, {
    variables: { offset, limit: PAGE_SIZE },
  });

  const page = data?.loans;
  const loans = page?.items ?? [];
  const totalCount = page?.totalCount ?? 0;
  const hasMore = page?.hasMore ?? false;
  const currentPage = Math.floor(offset / PAGE_SIZE) + 1;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  const handleCreated = () => {
    setModalOpen(false);
    refetch();
  };

  if (error) {
    return (
      <div>
        <PageTitle>Loans</PageTitle>
        <p style={{ color: "#c00" }}>Error: {error.message}</p>
      </div>
    );
  }

  return (
    <>
      <PageTitle>Loans</PageTitle>
      <Button onClick={() => setModalOpen(true)}>New Loan</Button>

      {loading ? (
        <p>Loading…</p>
      ) : loans.length === 0 ? (
        <EmptyState>No loans yet. Create one with “New Loan”.</EmptyState>
      ) : (
        <>
          <TableWrap>
            <Table>
              <thead>
                <tr>
                  <Th>Loan name</Th>
                  <Th>Principal</Th>
                  <Th>Start date</Th>
                  <Th>Total expected interest</Th>
                  <Th>Work days payments</Th>
                </tr>
              </thead>
              <tbody>
                {loans.map((loan: {
                  id: string;
                  name: string;
                  principalAmount: number;
                  startDate: string;
                  endDate: string;
                  totalExpectedInterest: number;
                  workDaysPayments: number;
                }) => (
                  <tr key={loan.id}>
                    <Td>
                      <RowLink
                        onClick={() => navigate(`/loan/${loan.id}`)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) =>
                          e.key === "Enter" && navigate(`/loan/${loan.id}`)
                        }
                      >
                        {loan.name}
                      </RowLink>
                    </Td>
                    <Td>{formatCurrency(loan.principalAmount)}</Td>
                    <Td>{loan.startDate}</Td>
                    <Td>{formatCurrency(loan.totalExpectedInterest)}</Td>
                    <Td>{loan.workDaysPayments}</Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </TableWrap>

          <PaginationWrap>
            <Button
              disabled={offset === 0}
              onClick={() => setOffset((o) => Math.max(0, o - PAGE_SIZE))}
            >
              Previous
            </Button>
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <Button
              disabled={!hasMore}
              onClick={() => setOffset((o) => o + PAGE_SIZE)}
            >
              Next
            </Button>
          </PaginationWrap>
        </>
      )}

      {modalOpen && (
        <NewLoanModal
          onClose={() => setModalOpen(false)}
          onCreated={handleCreated}
        />
      )}
    </>
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
