import { useState } from "react";
import { useMutation } from "@apollo/client/react";
import { CREATE_LOAN } from "../graphql/queries";
import {
  Overlay,
  ModalBox,
  ModalTitle,
  FormGroup,
  Label,
  Input,
  ModalActions,
  Button,
  CancelButton,
  ErrorMessage,
} from "./NewLoanModal.styles";

const DATE_VALIDATION_MESSAGE = "Start date must be before or equal to end date.";

interface NewLoanModalProps {
  onClose: () => void;
  onCreated: () => void;
}

/** Modal form to create a new loan (name, principal, start/end dates); calls onCreated on success and onClose to dismiss. */
export function NewLoanModal({ onClose, onCreated }: NewLoanModalProps) {
  const [name, setName] = useState("");
  const [principalAmount, setPrincipalAmount] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [dateError, setDateError] = useState<string | null>(null);
  const [createLoan, { loading, error }] = useMutation(CREATE_LOAN, {
    onCompleted: onCreated,
    onError: () => {},
  });

  const isInvalidDates = startDate && endDate && startDate > endDate;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setDateError(null);
    const principal = parseFloat(principalAmount);
    if (!name.trim() || Number.isNaN(principal) || !startDate || !endDate) return;
    if (startDate > endDate) {
      setDateError(DATE_VALIDATION_MESSAGE);
      return;
    }
    createLoan({
      variables: {
        input: {
          name: name.trim(),
          principalAmount: principal,
          startDate,
          endDate,
        },
      },
    });
  };

  return (
    <Overlay onClick={onClose} role="dialog" aria-modal="true" aria-label="New loan">
      <ModalBox onClick={(e) => e.stopPropagation()}>
        <ModalTitle>New Loan</ModalTitle>
        <form onSubmit={handleSubmit}>
          <FormGroup>
            <Label htmlFor="loan-name">Loan name</Label>
            <Input
              id="loan-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="e.g. Business Loan"
            />
          </FormGroup>
          <FormGroup>
            <Label htmlFor="principal">Principal amount</Label>
            <Input
              id="principal"
              type="number"
              min="0"
              step="0.01"
              value={principalAmount}
              onChange={(e) => setPrincipalAmount(e.target.value)}
              required
              placeholder="100000"
            />
          </FormGroup>
          <FormGroup>
            <Label htmlFor="start-date">Start date</Label>
            <Input
              id="start-date"
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setDateError(null);
              }}
              required
            />
          </FormGroup>
          <FormGroup>
            <Label htmlFor="end-date">End date</Label>
            <Input
              id="end-date"
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setDateError(null);
              }}
              required
            />
          </FormGroup>
          {dateError && (
            <ErrorMessage>{dateError}</ErrorMessage>
          )}
          {error && (
            <ErrorMessage>
              {error.message}
            </ErrorMessage>
          )}
          <ModalActions>
            <CancelButton type="button" onClick={onClose}>
              Cancel
            </CancelButton>
            <Button type="submit" disabled={loading || !!isInvalidDates}>
              {loading ? "Creating…" : "Create loan"}
            </Button>
          </ModalActions>
        </form>
      </ModalBox>
    </Overlay>
  );
}
