# Buddy Script — Engineering Documentation

## Overview

A full-stack social feed application where users authenticate, publish posts (text/images), like content, and participate in threaded comments. Built from provided HTML/CSS designs using Next.js for the frontend and Express/TypeORM for the REST API.

**Live**
- App: https://buddyscript-social-app.vercel.app/
- API: https://buddyscript-social-app.onrender.com/api/health

**Stack:** Next.js 14 (Vercel) · Express + TypeORM (Render) · PostgreSQL (Neon)

---

## What Was Built

### Features
- **Auth** — Register, login, logout, refresh tokens; bcrypt hashing; JWT in HTTP-only cookies with rotation
- **Feed** — Cursor-based pagination, infinite scroll, public/private visibility
- **Posts** — Text and image uploads; author-only delete
- **Social** — Likes on posts/comments, paginated liker lists, one-level comment threads
- **UX** — Optimistic like updates, client-side feed cache, image fallback, error boundaries, auto token refresh

### Security & Performance
- CORS allowlist, CSRF origin validation, Helmet headers, rate limiting, login lockout (5 failures → 15 min)
- DB transactions for count updates, denormalized `likeCount`/`commentCount`
- Cursor pagination, partial index on public feed, gzip compression, 60s server cache
- Structured JSON logging, `/api/health` with uptime and memory stats
- TypeORM migrations (no `synchronize` in production)

---

## Design Decisions

| Decision | Rationale | Trade-off |
|----------|-----------|-----------|
| **Cursor pagination** | Offset degrades at scale and causes page drift on inserts | Cannot jump to arbitrary pages |
| **Denormalized counts** | Avoids `COUNT(*)` on every feed request | Counts can drift; needs reconciliation jobs at scale |
| **HTTP-only cookies** | Tokens not accessible to JS, reducing XSS risk | Cross-origin requires `SameSite=None` and strict CORS |
| **Refresh token rotation** | Limits stolen token reuse; server-side invalidation | Extra DB write per refresh |
| **In-memory cache/rate limits** | Zero extra services for single-instance demo | Not safe for horizontal scaling |
| **Local file uploads** | No S3/CDN setup needed | Ephemeral on Render; lost on redeploy |
| **Monolithic API** | Lowest operational overhead | Cannot scale read/write paths independently |

---

## Free-Tier Constraints

| Constraint | Impact |
|------------|--------|
| Render free tier sleeps | Cold starts; external health checks needed |
| Single instance | All state in-process instead of Redis |
| No Redis | No distributed cache, queue, or shared rate limits |
| Neon free Postgres | Pool max 10 connections |
| Cross-origin (Vercel ↔ Render) | `SameSite=None`, strict CORS, CSRF origin check |
| No S3/CDN/Sentry budget | Uploads on disk, logs to stdout, no APM |

These are explicit trade-offs, not oversights. The codebase has clear swap points for externalizing cache, uploads, and queues.

---

## Improvements with Paid Infrastructure

Without free-tier constraints, the following upgrades would significantly improve reliability, performance, and scalability:

### 1. Persistent Object Storage (S3 / Cloudflare R2)
**Current:** Uploads stored on Render's ephemeral filesystem — lost on every redeploy.

**With paid hosting:** Store images in S3 or R2 with CDN (CloudFront/Cloudflare). Benefits:
- Uploads survive deployments permanently
- Global CDN reduces latency for image delivery
- Offloads bandwidth from the API server
- Enables image optimization pipeline (resize, compress, WebP conversion)

### 2. Redis for Distributed State
**Current:** Cache, rate limits, and login lockout use in-memory `Map` — not shared across instances, lost on restart.

**With paid hosting:** Redis (AWS ElastiCache, Upstash, or Redis Cloud). Benefits:
- **Horizontal scaling** — multiple API instances share the same cache and rate limit counters
- **Persistent rate limiting** — brute-force protection survives deploys
- **Session store** — instant token invalidation on logout (currently relies on DB)
- **Pub/sub** — cache invalidation across instances when posts are created

### 3. Always-On Instances with Load Balancing
**Current:** Single Render instance sleeps after 15 min inactivity → cold starts.

**With paid hosting:** 2+ instances behind a load balancer (AWS ALB, Cloudflare). Benefits:
- Zero cold start latency
- High availability — one instance can fail without downtime
- Auto-scaling based on traffic

### 4. Background Job Processing
**Current:** All work is synchronous in the request cycle.

**With paid hosting:** BullMQ + Redis for async tasks. Benefits:
- Image resizing/optimization after upload (faster response to user)
- Email notifications (welcome, mentions, digests)
- Scheduled cleanup of expired refresh tokens
- Periodic reconciliation of denormalized counts

### 5. Database Scaling
**Current:** Single Neon Postgres with 10-connection pool.

**With paid hosting:**
- **Read replicas** — route feed queries to replica, writes to primary
- **Connection pooling** (PgBouncer) — handle more concurrent users
- **Larger pool size** — tune per instance count

### 6. Real-Time Features
**Current:** Client refetches data after actions; no live updates.

**With paid hosting:** WebSockets (Socket.IO) or Server-Sent Events. Benefits:
- Instant like/comment notifications
- Live feed updates without refresh
- Online presence indicators

### 7. Observability & Reliability
**Current:** Structured logs to stdout, basic health endpoint, frontend error boundaries.

**With paid hosting:**
- **Sentry** — error tracking with stack traces and source maps
- **Datadog/New Relic** — APM with distributed tracing across DB and HTTP
- **Alerting** — PagerDuty on error spikes, latency p99, memory exhaustion
- **Centralized logging** — searchable logs with retention

### 8. Security Hardening
**Current:** App-level rate limiting and Helmet headers.

**With paid hosting:**
- **WAF** (Cloudflare, AWS WAF) — OWASP protection, bot mitigation
- **DDoS protection** — Cloudflare or AWS Shield
- **Secrets management** — HashiCorp Vault or AWS Secrets Manager with rotation

### 9. CI/CD & Testing
**Current:** Manual deploy from Git, ad-hoc test scripts.

**With paid hosting:**
- Automated test suite (Jest/Vitest unit, Playwright E2E)
- GitHub Actions pipeline: lint → test → build → deploy
- Staging environment mirroring production
- Blue-green or canary deployments for zero-downtime releases

---

## Scaling Priority Order

If moving off free tier, this order maximizes reliability per dollar:

1. **S3/R2 + CDN** — eliminates data loss risk (highest priority)
2. **Redis** — enables horizontal scaling and persistent rate limits
3. **Always-on instances** — eliminates cold starts
4. **Sentry** — catches errors before users report them
5. **CI/CD with tests** — prevents regressions
6. **Background workers** — improves response times
7. **Read replicas** — scales read-heavy feed queries
8. **WebSockets** — adds real-time UX

---

## Summary

Buddy Script implements production-ready patterns within free-tier constraints: cursor pagination, transactional writes, hashed refresh tokens, and defense-in-depth security.

The gaps are deliberate cost/complexity trade-offs with clear upgrade paths. The codebase is structured so cache (`cache.ts`), rate limiting (`rateLimiter.ts`), and uploads (`upload.middleware.ts`) can be swapped to Redis/S3 without rewriting business logic.

**Highest-priority production changes:** persistent uploads (S3) and Redis for horizontal scaling.
