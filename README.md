# Bullet Loan Manager

## Running the backend

From the project root:

```bash
npm install
npm run build
npm start
```

- Backend runs at **http://localhost:4000**
- GraphQL endpoint: **http://localhost:4000/graphql**

For development with file watching:

```bash
npm run dev
```

---

## Running the frontend

From the project root:

```bash
cd frontend
npm install
npm run dev
```

- Frontend runs at **http://localhost:5173**
- Start the backend first so the app can load data and create loans (frontend proxies `/graphql` to the backend).

---

## Database setup on first run

The app uses **SQLite** with TypeORM. You do not need to create the database or run migrations manually.

1. **First time you start the backend**, TypeORM will:
   - Create the `data/` folder in the project root if it does not exist
   - Create the database file `data/loans.sqlite`
   - Create or update the schema (tables for loans and payments) using `synchronize: true`

2. **No extra steps** are required: install dependencies, then run the backend as in “Running the backend” above. The database is ready to use as soon as the server prints “Server ready at …”.

To reset the database, stop the backend, delete `data/loans.sqlite` (and the `data/` folder if you like), then start the backend again so it recreates the file and schema.

---

## Unclear Instructions:

1. Loans can be created retrospectively (Past/Future/On going loans).
2. Why not just scrape the historical data once and store it, then dynamically update latest values and apply for new loans from DB? Fetch changes in date range and apply.

---

## Assumptions And Notes:

1. If start day and end day is the same day - The first month's interest and the last month's interest should sum to a 30 day interest (will seem like a 2 part payment for a month).
2. Last payment will occur on the end date of the loan (not on last day of the month like other payments).
3. On loan creation - if any value of prime rate is failed to be fetched, fail the new loan creation.
4. If a loan was taken on the last month's day, the interest for that month will be 0 (no full day of loan occurred).

## Suggestions To Do:
1. Add tests and arrange them.
2. Add more restrictions and easy shortcuts to FE (e.g like open new loan with focus in name text box).
3. Make more visually appealing.