import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
} from "typeorm";

@Entity("loans")
export class Loan {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", length: 255 })
  name!: string;

  /** Nullable in DB; GraphQL exposes non-null via resolver (`?? ""`). */
  @Column({ type: "varchar", length: 255, nullable: true })
  loanSource!: string | null;

  @Column({ type: "decimal", precision: 18, scale: 2 })
  principalAmount!: string;

  @Column({ type: "date" })
  startDate!: string;

  @Column({ type: "date" })
  endDate!: string;

  /** Annual interest rate at time of loan creation (e.g. 0.0825 for 8.25%) */
  @Column({ type: "decimal", precision: 10, scale: 6 })
  annualRate!: string;

  @CreateDateColumn({ type: "date" })
  createdAt!: Date;

  @OneToMany("Payment", (p: any) => p.loan)
  payments!: import("./Payment.js").Payment[];
}
