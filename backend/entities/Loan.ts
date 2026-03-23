import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
} from "typeorm";

export enum WorkDaysPaymentType {
  ALLOWED = 0,
  NEXT_DAY = 1,
  PREVIOUS_DAY = 2,
}

@Entity("loans")
export class Loan {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", length: 255 })
  name!: string;

  @Column({ type: "decimal", precision: 18, scale: 2 })
  principalAmount!: string;

  @Column({ type: "date" })
  startDate!: string;

  @Column({ type: "date" })
  endDate!: string;

  /** Annual interest rate at time of loan creation (e.g. 0.0825 for 8.25%) */
  @Column({ type: "decimal", precision: 10, scale: 6 })
  annualRate!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @OneToMany("Payment", (p: any) => p.loan)
  payments!: import("./Payment.js").Payment[];

  @Column({ type: "decimal", nullable: true})
  workDaysPayments!: number;
}
