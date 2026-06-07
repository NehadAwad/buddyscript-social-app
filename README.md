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

### Comments & Likes API

| Method | Endpoint | Description |
| ------ | -------- | ----------- |
| GET | `/api/posts/:id/comments` | List comments (oldest first, nested replies) |
| POST | `/api/posts/:id/comments` | Add comment or reply (`parentId` optional) |
| GET | `/api/comments/:id/replies` | Paginated replies |
| DELETE | `/api/comments/:id` | Delete own comment |
| POST | `/api/likes` | Like post or comment |
| DELETE | `/api/likes?targetId=&targetType=` | Unlike |
| GET | `/api/likes/:targetId/users?type=` | Who liked (paginated) |

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

## Deploy (Netlify + Render)

**Frontend → [Netlify](https://www.netlify.com)** (repo root includes `netlify.toml`, base directory `frontend`)

Netlify environment variables:

| Variable | Example |
| -------- | ------- |
| `NEXT_PUBLIC_API_URL` | `https://your-api.onrender.com/api` |
| `NEXT_PUBLIC_POST_FALLBACK_IMAGE` | `/static/post-fallback.png` |
| `NEXT_PUBLIC_POST_LOCAL_FALLBACK_IMAGE` | `/images/post-fallback.png` |

**Backend → [Render](https://render.com)** (or similar)

| Variable | Example |
| -------- | ------- |
| `DATABASE_URL` | Neon connection string |
| `NODE_ENV` | `production` |
| `PORT` | Set by Render (used automatically) |
| `CORS_ORIGIN` | `https://your-app.netlify.app` |
| `COOKIE_SECURE` | `true` |
| `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` | Long random strings |

When `COOKIE_SECURE=true`, auth cookies use `SameSite=None` so login works across Netlify and Render. For multiple Netlify URLs (prod + previews), use comma-separated `CORS_ORIGIN`.

After deploy, run migrations once against production Postgres:

```bash
cd backend && npm run migration:run
```
