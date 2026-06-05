# Buddy Script Social App

Full-stack social feed application (Next.js, Express, PostgreSQL, TypeORM).

## Prerequisites

- Node.js 20+
- PostgreSQL 14+ running locally

Docker is optional and not required for development.

## Local setup

### 1. Environment

```bash
cp .env.example .env
cp frontend/.env.local.example frontend/.env.local
```

Edit `.env` if your Postgres credentials differ from the defaults.

### 2. Database

Create the database and user (run once):

```bash
chmod +x scripts/setup-local-db.sh
./scripts/setup-local-db.sh
```

Or manually with `psql`:

```sql
CREATE USER appifylab WITH PASSWORD 'changeme';
CREATE DATABASE social_feed OWNER appifylab;
```

### 3. Install dependencies

```bash
cd backend && npm install
cd ../frontend && npm install
```

### 4. Run the app

Use two terminals:

```bash
# Terminal 1 — API (port 4000)
npm run dev:backend

# Terminal 2 — UI (port 3000)
npm run dev:frontend
```

Or from each folder:

```bash
cd backend && npm run dev
cd frontend && npm run dev
```

| Service  | URL |
| -------- | --- |
| Frontend | http://localhost:3000 |
| Backend  | http://localhost:4000/api/health |

### Port already in use?

Change `BACKEND_PORT` in `.env` (e.g. `4001`) and update `NEXT_PUBLIC_API_URL` in `frontend/.env.local` to match.

## Project structure

```
├── backend/              # Express API
├── frontend/             # Next.js App Router
├── Base /                # Original HTML/CSS design reference
├── .env.example          # Local env template (copy to .env)
├── docker-compose.yml    # Optional — not needed for local dev
└── scripts/
    └── setup-local-db.sh
```

## Optional: Docker

Only if you want containerized Postgres or full stack in containers:

```bash
cp .env.example .env
docker compose up --build
```

For Docker, set `DATABASE_HOST=postgres` and `DATABASE_URL=postgresql://...@postgres:5432/...` in `.env`.
