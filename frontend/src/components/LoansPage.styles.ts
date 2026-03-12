import styled from "styled-components";

export const PageTitle = styled.h1`
  margin: 0 0 16px 0;
  font-size: 1.5rem;
  font-weight: 600;
`;

export const Button = styled.button`
  padding: 8px 16px;
  margin-bottom: 16px;
  font-size: 0.95rem;
  background: #2563eb;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  &:hover:not(:disabled) {
    background: #1d4ed8;
  }
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const TableWrap = styled.div`
  overflow-x: auto;
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 16px;
`;

export const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

export const Th = styled.th`
  text-align: left;
  padding: 12px 16px;
  font-weight: 600;
  color: #374151;
  border-bottom: 2px solid #e5e7eb;
`;

export const Td = styled.td`
  padding: 12px 16px;
  border-bottom: 1px solid #e5e7eb;
`;

export const RowLink = styled.span`
  color: #2563eb;
  cursor: pointer;
  text-decoration: none;
  &:hover {
    text-decoration: underline;
  }
`;

export const PaginationWrap = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

export const EmptyState = styled.p`
  color: #6b7280;
  margin: 24px 0;
`;
