import styled from "styled-components";

export const PageTitle = styled.h1`
  margin: 0 0 8px 0;
  font-size: 1.5rem;
  font-weight: 600;
`;

export const BackButton = styled.button`
  padding: 6px 12px;
  margin-bottom: 16px;
  font-size: 0.9rem;
  background: transparent;
  color: #2563eb;
  border: 1px solid #2563eb;
  border-radius: 6px;
  cursor: pointer;
  &:hover {
    background: #eff6ff;
  }
`;

export const ScheduleSection = styled.section`
  margin-top: 24px;
  h2 {
    font-size: 1.125rem;
    font-weight: 600;
    margin: 0 0 12px 0;
  }
`;

export const TableWrap = styled.div`
  overflow-x: auto;
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
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
