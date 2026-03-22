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
  Filter,
  FilterInput,
  LoadingText,
  ErrorText,
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
        loanSource: string;
        principalAmount: number;
        createdAt: string;
        startDate: string;
        endDate: string;
        totalExpectedInterest: number;
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
        <ErrorText>Error: {error.message}</ErrorText>
      </div>
    );
  }

  return (
    <>
      <PageTitle>Loans</PageTitle>
      <Button onClick={() => setModalOpen(true)}>New Loan</Button>

      {loading ? (
        <LoadingText>Loading…</LoadingText>
      ) : loans.length === 0 ? (
        <EmptyState>No loans yet. Create one with “New Loan”.</EmptyState>
      ) : (
        <>
          <Filter>
            <FilterInput
              type="text"
              id="table-filter-input"
              onChange={() => tableFilter()}
              placeholder="Search by loan name"
            />
            <Button type="button" onClick={() => clearFilterInput()}>
              Clear Filter
            </Button>
          </Filter>
          <TableWrap>
            <Table id="loans-table">
              <thead>
                <tr>
                  <Th>Loan name</Th>
                  <Th>Loan source</Th>
                  <Th>Principal</Th>
                  <Th>Creation date</Th>
                  <Th>Start date</Th>
                  <Th>End date</Th>
                  <Th>Total expected interest</Th>
                </tr>
              </thead>
              <tbody>
                {loans.map((loan: {
                  id: string;
                  name: string;
                  loanSource: string;
                  principalAmount: number;
                  createdAt: string;
                  startDate: string;
                  endDate: string;
                  totalExpectedInterest: number;
                }) => (
                  <tr key={loan.id}>
                    <Td id="loan-name">
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
                    <Td>{loan.loanSource}</Td>
                    <Td>{formatCurrency(loan.principalAmount)}</Td>
                    <Td>{loan.createdAt}</Td>
                    <Td>{loan.startDate}</Td>
                    <Td>{loan.endDate}</Td>
                    <Td>{formatCurrency(loan.totalExpectedInterest)}</Td>
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

function tableFilter() {
  const filterInput = document.getElementById('table-filter-input') as HTMLInputElement;
  const table = document.getElementById('loans-table') as HTMLTableElement;
  const rows = table.getElementsByTagName('tr');

  for (const row of rows) {
    const cells = row.getElementsByTagName('td');
    for (const cell of cells) {
      if (cell.id === 'loan-name') {
        if (filterInput.value === '' || (cell.textContent ?? "").toLowerCase().includes(filterInput.value.toLowerCase())) {
          row.style.display = 'table-row';
        }
        else {
          row.style.display = 'none';
        }
      }
    }
  }
}

function clearFilterInput() {
  const inputElement = document.getElementById('table-filter-input') as HTMLInputElement;
  if (inputElement) {
      inputElement.value = '';
      tableFilter(); // Re-run the filter function to show all rows
  }
}