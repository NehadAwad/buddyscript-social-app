# Buddy Script

A full-stack social feed application with JWT authentication, threaded discussions, and a responsive UI built from a custom design system.

| | |
|---|---|
| **App** | [buddyscript-social-app.vercel.app](https://buddyscript-social-app.vercel.app/) |
| **API** | [buddyscript-social-app.onrender.com](https://buddyscript-social-app.onrender.com/api/health) |

## Overview

Buddy Script is a social platform where users can publish posts, engage through likes and threaded comments, and control post visibility. The interface is built with Next.js and styled to match the original HTML/CSS design; the API is a REST backend with session management via HTTP-only cookies.

For architecture decisions, trade-offs, and scaling notes, see **[DOCUMENTATION.md](./DOCUMENTATION.md)**.

## Features

- User registration and login with secure password handling
- Protected feed with public and private posts
- Post creation with text and image uploads
- Cursor-paginated feed with infinite scroll
- Likes on posts, comments, and replies with paginated liker lists
- One-level comment threads with optimistic UI updates
- Graceful image fallback when uploads are unavailable

## Tech Stack

| Layer | Technologies |
|-------|----------------|
| Frontend | Next.js 14, React 18, TypeScript |
| Backend | Express, TypeORM, TypeScript |
| Database | PostgreSQL |
| Auth | JWT (access + refresh), bcrypt, HTTP-only cookies |

## Engineering

- **Security** — CORS allowlisting, CSRF origin validation, rate limiting, bcrypt (cost 12), Helmet headers
- **Performance** — Cursor pagination, denormalized counts, response compression, partial DB indexes, client-side stale-while-revalidate cache
- **Reliability** — Structured logging, health endpoint with memory metrics, error boundaries, automatic token refresh

## Architecture

```
frontend/   Next.js App Router — pages, components, client API layer
backend/    Express REST API — auth, posts, comments, likes
```

The frontend and API are deployed as separate services. Cross-origin requests use credentialed fetches; the API enforces authorization on every protected resource. Feed queries are designed for scale with cursor-based pagination and indexed visibility filters.

## Local Development

**Requirements:** Node.js 20+, PostgreSQL

```bash
cp .env.example .env
cp frontend/.env.local.example frontend/.env.local

cd backend && npm install && npm run migration:run
cd ../frontend && npm install

npm run dev:backend   # http://localhost:4000
npm run dev:frontend  # http://localhost:3000
```

Environment templates: `.env.example`, `frontend/.env.local.example`

## API Reference

<details>
<summary>Endpoints</summary>

**Auth**

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Sign in |
| POST | `/api/auth/refresh` | Rotate tokens |
| POST | `/api/auth/logout` | Sign out |
| GET | `/api/auth/me` | Current user |

**Posts & social**

| Method | Path | Description |
|--------|------|-------------|
| GET / POST | `/api/posts` | Feed (cursor) / create post |
| DELETE | `/api/posts/:id` | Delete own post |
| GET / POST | `/api/posts/:id/comments` | Comments / add comment or reply |
| POST / DELETE | `/api/likes` | Like / unlike |
| GET | `/api/likes/:targetId/users` | Paginated likers |

</details>

## Documentation

**[DOCUMENTATION.md](./DOCUMENTATION.md)** — What was built, design decisions, free-tier constraints, deferred improvements, and a production scaling roadmap.

## Project Structure

```
├── backend/          Express API, entities, migrations
├── frontend/         Next.js application
├── DOCUMENTATION.md  Engineering notes and scaling considerations
├── Base /            Original HTML/CSS design reference
└── docker-compose.yml
```
