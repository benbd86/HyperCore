import styled from "styled-components";

export const PageTitle = styled.h1`
  margin: 0 0 8px 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-primary);
`;

export const BackButton = styled.button`
  padding: 6px 12px;
  margin-bottom: 16px;
  font-size: 0.9rem;
  background: transparent;
  color: var(--link);
  border: 1px solid var(--link);
  border-radius: 6px;
  cursor: pointer;
  &:hover {
    background: var(--link-hover-bg);
  }
`;

export const MetaBlock = styled.div`
  color: var(--text-primary);
  line-height: 1.6;
  p {
    margin: 0 0 0.5rem 0;
    color: var(--text-primary);
  }
`;

export const ScheduleSection = styled.section`
  margin-top: 24px;
  h2 {
    font-size: 1.125rem;
    font-weight: 600;
    margin: 0 0 12px 0;
    color: var(--text-primary);
  }
  p {
    color: var(--text-muted);
  }
`;

export const TableWrap = styled.div`
  overflow-x: auto;
  background: var(--bg-elevated);
  border-radius: 8px;
  box-shadow: var(--shadow);
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
