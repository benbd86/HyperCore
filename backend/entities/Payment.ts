import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from "typeorm";

export type PaymentType = "Interest" | "Principal + Interest";

@Entity("payments")
export class Payment {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "uuid" })
  loanId!: string;

  @ManyToOne("Loan", { onDelete: "CASCADE" })
  @JoinColumn({ name: "loanId" })
  loan!: import("./Loan.js").Loan;

  @Column({ type: "date" })
  paymentDate!: string;

  @Column({ type: "varchar", length: 32 })
  paymentType!: PaymentType;

  @Column({ type: "decimal", precision: 18, scale: 2 })
  principalComponent!: string;

  @Column({ type: "decimal", precision: 18, scale: 2 })
  interestComponent!: string;

  @Column({ type: "decimal", precision: 18, scale: 2 })
  totalAmount!: string;

  @Column({ type: "decimal", precision: 18, scale: 2 })
  remainingBalance!: string;
}
