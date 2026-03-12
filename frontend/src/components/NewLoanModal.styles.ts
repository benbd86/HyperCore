import styled from "styled-components";

export const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 16px;
`;

export const ModalBox = styled.div`
  background: white;
  border-radius: 8px;
  padding: 24px;
  max-width: 400px;
  width: 100%;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
`;

export const ModalTitle = styled.h2`
  margin: 0 0 20px 0;
  font-size: 1.25rem;
  font-weight: 600;
`;

export const FormGroup = styled.div`
  margin-bottom: 16px;
`;

export const Label = styled.label`
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 4px;
`;

export const Input = styled.input`
  width: 100%;
  padding: 8px 12px;
  font-size: 0.95rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  &:focus {
    outline: none;
    border-color: #2563eb;
    box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.2);
  }
`;

export const ModalActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
`;

export const CancelButton = styled.button`
  padding: 8px 16px;
  font-size: 0.95rem;
  background: #f3f4f6;
  color: #374151;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  cursor: pointer;
  &:hover {
    background: #e5e7eb;
  }
`;

export const Button = styled.button`
  padding: 8px 16px;
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
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

export const ErrorMessage = styled.p`
  color: #b91c1c;
  font-size: 0.875rem;
  margin: 8px 0 0 0;
`;
