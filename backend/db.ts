import "reflect-metadata";
import { DataSource } from "typeorm";
import path from "path";
import fs from "fs";
import { Loan } from "./entities/Loan.js";
import { Payment } from "./entities/Payment.js";

// Use project root for database so it works from dist/ or from repo root
const databasePath = path.join(process.cwd(), "data", "loans.sqlite");

export const AppDataSource = new DataSource({
  type: "better-sqlite3",
  database: databasePath,
  synchronize: true,
  logging: false,
  entities: [Loan, Payment],
});

export async function initDb(): Promise<DataSource> {
  const dir = path.dirname(databasePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }
  return AppDataSource;
}
