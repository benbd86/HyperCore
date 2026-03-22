import styled from "styled-components";

export const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: var(--overlay);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 16px;
`;

export const ModalBox = styled.div`
  background: var(--bg-elevated);
  color: var(--text-primary);
  border-radius: 8px;
  padding: 24px;
  max-width: 400px;
  width: 100%;
  box-shadow: var(--shadow-modal);
  border: 1px solid var(--border);
`;

export const ModalTitle = styled.h2`
  margin: 0 0 20px 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
`;

export const FormGroup = styled.div`
  margin-bottom: 16px;
`;

export const Label = styled.label`
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-secondary);
  margin-bottom: 4px;
`;

export const Input = styled.input`
  width: 100%;
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

export const ModalActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
`;

export const CancelButton = styled.button`
  padding: 8px 16px;
  font-size: 0.95rem;
  background: var(--bg-button-secondary);
  color: var(--text-secondary);
  border: 1px solid var(--border-strong);
  border-radius: 6px;
  cursor: pointer;
  &:hover {
    background: var(--bg-button-secondary-hover);
  }
`;

export const Button = styled.button`
  padding: 8px 16px;
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
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

export const ErrorMessage = styled.p`
  color: var(--error);
  font-size: 0.875rem;
  margin: 8px 0 0 0;
`;
