# Buddy Script Social App

Full-stack social feed application (Next.js, Express, PostgreSQL, TypeORM).

## Prerequisites

- Node.js 20+
- PostgreSQL database ([Neon](https://neon.tech) recommended)

Docker is optional and not required for development.

## Local setup

### 1. Environment

```bash
cp .env.example .env
cp frontend/.env.local.example frontend/.env.local
```

Edit `.env` if your Postgres credentials differ from the defaults.

### 2. Database migrations

Run once against your `DATABASE_URL` (Neon or local Postgres):

```bash
cd backend
npm install
npm run migration:run
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

### Auth API

| Method | Endpoint | Description |
| ------ | -------- | ----------- |
| POST | `/api/auth/register` | Register (`firstName`, `lastName`, `email`, `password`) |
| POST | `/api/auth/login` | Login (`email`, `password`) |
| POST | `/api/auth/refresh` | Rotate tokens (uses `refresh_token` cookie) |
| POST | `/api/auth/logout` | Logout and clear cookies |
| GET | `/api/auth/me` | Current user (requires `access_token` cookie) |

Tokens are stored in HTTP-only cookies. Send `credentials: 'include'` from the frontend.

### Port already in use?

Change `BACKEND_PORT` in `.env` (e.g. `4001`) and update `NEXT_PUBLIC_API_URL` in `frontend/.env.local` to match.

## Project structure

```
├── backend/              # Express API
├── frontend/             # Next.js App Router
├── Base /                # HTML/CSS design assets
├── .env.example          # Local env template (copy to .env)
├── docker-compose.yml    # Optional — not needed for local dev
└── backend/src/
    ├── entities/         # TypeORM models
    └── migrations/       # Schema migrations
```

## Optional: Docker

Only if you want containerized Postgres or full stack in containers:

```bash
cp .env.example .env
docker compose up --build
```

For Docker, set `DATABASE_HOST=postgres` and `DATABASE_URL=postgresql://...@postgres:5432/...` in `.env`.
