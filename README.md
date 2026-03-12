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
