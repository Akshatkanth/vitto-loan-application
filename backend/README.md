# Vitto Backend

Express + PostgreSQL API for the Vitto Loan Application Portal.

## Setup

```bash
npm install
cp .env.example .env
# Fill in DATABASE_URL from Neon dashboard
npm run dev
```

## Deploy on Render

- Root directory: `backend/`
- Start command: `node src/index.js`
- Environment variables: `DATABASE_URL`, `PORT`, `FRONTEND_URL`
