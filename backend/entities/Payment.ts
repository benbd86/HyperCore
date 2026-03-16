import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from "typeorm";

export type PaymentType = "Interest" | "Principal + Interest";

/** TypeORM entity for a single payment on a loan: date, type, principal/interest components, balance, prime rate range. */
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

  /** Prime rate range for this payment's interest period (e.g. "6.75%" or "6.50% - 7.00%"). */
  @Column({ type: "varchar", length: 32, nullable: true })
  primeRateRange!: string | null;
}
