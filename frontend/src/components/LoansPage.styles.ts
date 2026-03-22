import styled from "styled-components";

export const PageTitle = styled.h1`
  margin: 0 0 16px 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-primary);
`;

export const Button = styled.button`
  padding: 8px 16px;
  margin-bottom: 16px;
  font-size: 0.95rem;
  background: var(--accent);
  color: #ffffff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  &:hover:not(:disabled) {
    background: var(--accent-hover);
  }
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const Filter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  gap: 12px;
  flex-wrap: wrap;
`;

export const FilterInput = styled.input`
  flex: 1;
  min-width: 180px;
  padding: 8px 12px;
  font-size: 0.95rem;
  border: 1px solid var(--border-strong);
  border-radius: 6px;
  background: var(--bg-input);
  color: var(--text-primary);
  &::placeholder {
    color: var(--text-muted);
  }
  &:focus {
    outline: none;
    border-color: var(--border-focus);
    box-shadow: 0 0 0 2px var(--focus-ring);
  }
`;

export const TableWrap = styled.div`
  overflow-x: auto;
  background: var(--bg-elevated);
  border-radius: 8px;
  box-shadow: var(--shadow);
  margin-bottom: 16px;
  border: 1px solid var(--border);
`;

export const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

export const Th = styled.th`
  text-align: left;
  padding: 12px 16px;
  font-weight: 600;
  color: var(--text-secondary);
  border-bottom: 2px solid var(--border);
  background: var(--bg-elevated);
`;

export const Td = styled.td`
  padding: 12px 16px;
  border-bottom: 1px solid var(--border);
  color: var(--text-primary);
`;

export const RowLink = styled.span`
  color: var(--link);
  cursor: pointer;
  text-decoration: none;
  &:hover {
    text-decoration: underline;
    color: var(--link-hover);
  }
`;

export const PaginationWrap = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  color: var(--text-primary);
`;

export const EmptyState = styled.p`
  color: var(--text-muted);
  margin: 24px 0;
`;

export const LoadingText = styled.p`
  color: var(--text-muted);
`;

export const ErrorText = styled.p`
  color: var(--error);
  background: var(--error-bg);
  padding: 0.75rem 1rem;
  border-radius: 6px;
  border: 1px solid var(--border);
`;
