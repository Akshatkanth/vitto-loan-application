# Vitto — Loan Application Portal

A full-stack loan application portal built for FinTech company **Vitto**. Applicants can submit loan applications in their preferred language, and admins can review, approve, or reject them from a real-time dashboard.

---

## Live URLs

| Service  | URL |
|----------|-----|
| Frontend | https://vitto-loan-application.vercel.app/ |
| Backend API | https://vitto-api-gw01.onrender.com |

---

## Tech Stack

- **Frontend**: React + Vite + Tailwind CSS + React Router v6
- **Backend**: Node.js + Express + PostgreSQL (Neon)
- **Deployment**: Frontend → Vercel, Backend → Render

---

## Local Setup

### Prerequisites
- Node.js ≥ 18
- A [Neon](https://neon.tech) PostgreSQL database (free tier)

### 1. Clone the repo
```bash
git clone https://github.com/Akshatkanth/vitto-loan-application.git
cd vitto-loan-application
```

### 2. Run the database migration
In the Neon SQL editor (or any PostgreSQL client), run:
```sql
-- contents of backend/migrations/001_init.sql
```
Or pipe it directly:
```bash
psql $DATABASE_URL -f backend/migrations/001_init.sql
```

### 3. Start the backend
```bash
cd backend
cp .env.example .env
# Edit .env and fill in your DATABASE_URL from Neon
npm install
npm run dev
```
Backend will run at `http://localhost:5000`.

### 4. Start the frontend
```bash
cd frontend
cp .env.example .env
# .env already points to http://localhost:5000 for local dev
npm install
npm run dev
```
Frontend will run at `http://localhost:5173`.

---

## Environment Variables

### Backend (`backend/.env`)
| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | Neon PostgreSQL connection string |
| `PORT` | Server port (default: 5000) |
| `FRONTEND_URL` | Deployed frontend URL (for CORS) |

### Frontend (`frontend/.env`)
| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Backend API base URL |

---

## Deployment

### Backend → Render
1. Connect your GitHub repo on [render.com](https://render.com)
2. Set **Root Directory** to `backend/`
3. Set **Start Command** to `node src/index.js`
4. Add environment variables: `DATABASE_URL`, `PORT`, `FRONTEND_URL`

### Frontend → Vercel
1. Import your GitHub repo on [vercel.com](https://vercel.com)
2. Set **Root Directory** to `frontend/`
3. Add environment variable: `VITE_API_URL=https://vitto-api-gw01.onrender.com`

---

## API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/applications` | Submit a new loan application |
| `GET` | `/api/applications` | List all applications (optional `?status=` filter) |
| `PATCH` | `/api/applications/:id/status` | Update application status |
| `GET` | `/api/summary` | Get aggregated dashboard stats |
| `GET` | `/health` | Health check |

---

## Known Issues / Future Improvements

- [ ] Add pagination to the dashboard table for large datasets
- [ ] Add JWT-based admin authentication
- [ ] Email/SMS notification on status change
- [ ] Export applications to CSV
- [ ] Add loan eligibility scoring
