# Buddy Script — Engineering Documentation

## 1. Purpose

This document describes what was built, the architectural decisions behind it, and what would change in a production environment without free-tier hosting constraints.

The application is a full-stack social feed: users authenticate, publish posts (text/image), like content, and participate in one-level comment threads. The UI was implemented from provided HTML/CSS using Next.js; the backend is a REST API with PostgreSQL.

**Live**
- App: https://buddyscript-social-app.vercel.app/
- API: https://buddyscript-social-app.onrender.com/api/health

---

## 2. Current Architecture

```
┌─────────────┐         credentialed fetch          ┌─────────────────────┐
│   Vercel    │ ──────────────────────────────────▶ │  Render (1 instance) │
│  Next.js 14 │         HTTP-only cookies           │  Express + TypeORM   │
└─────────────┘                                     └──────────┬──────────┘
                                                               │
                     ┌─────────────────────────────────────────┼──────────────┐
                     │                                         ▼              │
                     │  In-process state (not shared):      │
                     │  • feed cache (Map, TTL 60s)                           │
                     │  • rate limits (express-rate-limit, in-memory)         │
                     │  • login lockout counters (Map)                        │
                     │                                                         │
                     │  Ephemeral disk:                                        │
                     │  • uploads/ (multer → local filesystem)                │
                     └─────────────────────────────────────────────────────────┘
                                                               │
                                                               ▼
                                                    ┌─────────────────────┐
                                                    │  Neon PostgreSQL     │
                                                    │  (pooled connection) │
                                                    └─────────────────────┘
```

**Deployment model:** Decoupled frontend (Vercel) and API (Render). Auth crosses origins via `SameSite=None; Secure` cookies. The API is a single stateful process — a deliberate simplification for zero-cost hosting.

---

## 3. What Was Built

### Functional scope

| Area | Implementation |
|------|----------------|
| Auth | Register, login, logout, refresh, `/me`; bcrypt (cost 12); JWT access + refresh; refresh tokens hashed and stored in Postgres with rotation on use |
| Feed | Cursor-based pagination, infinite scroll, public/private visibility rules |
| Posts | Text and optional image upload; author-only delete |
| Social | Likes on posts/comments; paginated liker lists; one-level comment threads |
| Frontend UX | Optimistic like updates, sessionStorage feed cache, image fallback, error boundaries, automatic token refresh on 401 |

### Non-functional scope (implemented)

| Concern | Approach |
|---------|----------|
| Security | CORS allowlist, CSRF `Origin` validation, Helmet, route-level auth, login lockout (5 failures → 15 min) |
| Data integrity | DB transactions for likes and comment count updates; denormalized `likeCount` / `commentCount` kept in sync inside transactions |
| Performance | Cursor pagination, partial index on public feed, gzip compression, 60s server feed cache, client stale cache |
| Operability | Structured JSON request/error logs, `/api/health` with uptime and memory stats |
| Schema evolution | TypeORM migrations (no `synchronize` in production) |

---

## 4. Design Decisions & Trade-offs

Each decision below includes what was gained and what was consciously deferred.

### 4.1 Cursor pagination (feed, comments, likers)

**Choice:** Keyset/cursor pagination using `(createdAt, id)` instead of `OFFSET/LIMIT`.

**Why:** Offset pagination degrades as tables grow and produces inconsistent pages when rows are inserted during scrolling.

**Trade-off:** Cursors are harder to jump to arbitrary pages; acceptable for an infinite-scroll feed.

---

### 4.2 Denormalized counts

**Choice:** `likeCount` and `commentCount` stored on `Post` / `Comment`, updated inside transactions when likes or comments change.

**Why:** Avoids `COUNT(*)` subqueries on every feed request.

**Trade-off:** Counts can drift if a write fails mid-transaction or if data is modified outside the service layer. At scale, periodic reconciliation jobs or triggers would be added.

---

### 4.3 JWT in HTTP-only cookies (not localStorage)

**Choice:** Access token (short-lived) and refresh token (long-lived) in `httpOnly` cookies; frontend uses `credentials: "include"`.

**Why:** Tokens are not readable by client-side JavaScript, reducing XSS blast radius.

**Trade-off:** Cross-origin deployment requires `SameSite=None`, correct `CORS_ORIGIN`, and `trust proxy` on the API. Cookie-based auth is also less natural for native/mobile clients without a BFF.

---

### 4.4 Refresh token rotation with DB persistence

**Choice:** Refresh tokens are hashed (SHA-256) and stored in `refresh_tokens`; each refresh deletes the old row and issues a new pair.

**Why:** Stolen refresh tokens have a limited reuse window; logout can invalidate server-side state.

**Trade-off:** Extra DB writes per refresh. No cleanup cron for expired rows yet (see §6).

---

### 4.5 In-process cache and rate limiting

**Choice:** `Map`-based feed cache (max 500 entries, 60s TTL), `express-rate-limit` defaults, in-memory login lockout.

**Why:** Zero additional services or cost; sufficient for a single instance and demo traffic.

**Trade-off:** **Not safe for horizontal scaling.** Cache is per-process, rate limits reset per instance, and lockout state is lost on deploy/restart. This is the largest architectural limitation of the current deployment.

---

### 4.6 Local filesystem uploads

**Choice:** Multer writes to `uploads/` on the API server; static fallback images in `assets/`.

**Why:** No object storage account or CDN setup required.

**Trade-off:** **Render’s filesystem is ephemeral.** Uploads are lost on redeploy unless persisted externally. Production must move to S3/R2 + CDN immediately.

---

### 4.7 Monolithic Express API

**Choice:** Single deployable service handling auth, posts, comments, likes, and static file serving.

**Why:** Lowest operational overhead for a portfolio/assignment deliverable.

**Trade-off:** Cannot scale read-heavy and write-heavy paths independently. Extraction into auth service, media service, or notification service would come later.

---

## 5. Free-Tier Constraints That Shaped the Design

| Constraint | Impact on architecture |
|------------|------------------------|
| Render free web service sleeps after inactivity | Cold starts; health endpoint used for external uptime checks |
| Single Render instance | All ephemeral state kept in-process instead of Redis |
| No managed Redis on free tier | No distributed cache, queue, or shared rate limiting |
| Neon free Postgres | Single database, connection limits → pool max 10 in TypeORM config |
| Vercel + Render cross-origin | Cookie `SameSite=None`, strict `CORS_ORIGIN` (no trailing slash), CSRF origin check |
| No budget for S3/CDN/WAF/Sentry | Uploads on disk; logs to stdout; no APM or error tracking SaaS |
| Assignment scope / time | No real-time layer, search, notifications, admin tools, or full test pyramid |

These are not oversights — they are explicit cost/complexity trade-offs. The codebase is structured so the main externalizations (cache, uploads, queues) have clear swap points.

---

## 6. Not Implemented (Deferred) — With Rationale

### 6.1 Infrastructure & state

| Gap | Current state | Why deferred | Production path |
|-----|---------------|--------------|-----------------|
| **Redis** | In-memory cache, rate limits, lockout | Extra service + cost | Replace `cache.ts`, rate limiter store, and lockout with Redis; enables multi-instance deploy |
| **Object storage** | Local `uploads/` | Simplicity | Presigned S3/R2 upload; serve via CDN URL stored in `imageUrl` |
| **Horizontal scaling** | 1 API instance | Stateful in-process design | Load balancer + N instances after Redis externalization |
| **Read replicas** | Single Neon primary | Free tier + low traffic | Route feed reads to replica; writes stay on primary |
| **PgBouncer / pooler** | TypeORM pool (max 10) | Neon provides pooled URL | Tune pool size per instance × replica count |

### 6.2 Async & real-time

| Gap | Current state | Why deferred | Production path |
|-----|---------------|--------------|-----------------|
| **Background jobs** | All work synchronous in request | No queue infrastructure | BullMQ + Redis: image resize, email, token cleanup, count reconciliation |
| **WebSockets / SSE** | Client refetches on action | Complexity + connection cost on free tier | Socket.IO or SSE for live likes, comments, notifications |
| **Push / email** | None | Out of scope | Transactional email + in-app notification store |

### 6.3 Observability & reliability

| Gap | Current state | Why deferred | Production path |
|-----|---------------|--------------|-----------------|
| **Centralized logging** | JSON to stdout | Render captures logs | Datadog / Loki + log drains |
| **APM / tracing** | None | Cost | OpenTelemetry → Datadog/New Relic; trace DB and HTTP |
| **Error tracking** | Error boundaries + console | Cost | Sentry (frontend + backend) with source maps |
| **Alerting** | Manual health checks | No on-call stack | PagerDuty/Opsgenie on error rate, latency p99, memory |
| **SLOs / SLIs** | None | Early stage | Define availability and latency targets per endpoint |

### 6.4 Security & compliance

| Gap | Current state | Why deferred | Production path |
|-----|---------------|--------------|-----------------|
| **WAF / DDoS** | App-level rate limits only | Free tier | Cloudflare or AWS WAF in front of API |
| **Secrets management** | Render/Vercel env vars | Adequate for demo | Vault / AWS Secrets Manager + rotation |
| **Audit log** | Request logs only | Scope | Immutable audit table for auth and moderation actions |
| **Content moderation** | None | Scope | Reporting queue, admin review, automated scanning |
| **Refresh token cleanup** | Expired rows remain until touched | No cron on free tier | Scheduled job to purge `expires_at < now()` |

### 6.5 Engineering maturity

| Gap | Current state | Why deferred | Production path |
|-----|---------------|--------------|-----------------|
| **Automated test suite** | Ad-hoc `tsx` scripts only | Time / scope | Jest/Vitest unit tests; Playwright E2E; CI gate on PR |
| **CI/CD pipeline** | Manual deploy from Git | Simplicity | GitHub Actions: lint, test, build, deploy staging → prod |
| **Staging environment** | None | Cost | Mirror of prod with separate DB and secrets |
| **API contract** | README table | Scope | OpenAPI spec + generated client types |
| **Feature flags** | None | Scope | LaunchDarkly or env-based flags for safe rollout |
| **Idempotency** | Like POST is not idempotent-keyed | Low risk at current scale | `Idempotency-Key` header for writes |

### 6.6 Product & data model (future scale)

| Gap | Notes |
|-----|-------|
| **Full-text search** | Feed is chronological only; no post search (Elasticsearch/Meilisearch) |
| **Fan-out feed** | Global feed works today; high-follower users would need precomputed timelines |
| **CQRS / event sourcing** | Not needed until read/write patterns diverge significantly |
| **Sharding** | Single Postgres sufficient until write throughput becomes the bottleneck |

---

## 7. Scaling Roadmap (Prioritized)

If moving off free tier, this is the order that maximizes reliability per dollar:

### Phase 1 — Fix data loss and multi-instance blockers
1. **S3/R2 + CDN** for uploads (eliminates ephemeral disk risk)
2. **Redis** for cache, rate limiting, and login lockout
3. **Always-on API** with 2+ instances behind a load balancer

### Phase 2 — Operability
4. **Sentry** + structured log drain
5. **CI/CD** with tests blocking merge
6. **Staging** environment
7. **Cron/worker** for token cleanup and count reconciliation

### Phase 3 — Performance at growth
8. **Read replica** for feed queries
9. **Background workers** for image processing and notifications
10. **CDN cache rules** for API responses where safe (public assets only)

### Phase 4 — Product scale
11. **WebSockets** for real-time updates
12. **Search index** for content discovery
13. **Service extraction** only when team or load justifies it (media, notifications)

---

## 8. Target Production Architecture

```
                         ┌──────────────┐
                         │  Cloudflare  │
                         │  WAF + CDN   │
                         └──────┬───────┘
                                │
         ┌──────────────────────┼──────────────────────┐
         ▼                      ▼                      ▼
  ┌─────────────┐      ┌──────────────┐      ┌─────────────┐
  │   Vercel    │      │     ALB      │      │  S3 / R2    │
  │  Next.js    │─────▶│  API × N     │      │  + CDN      │
  └─────────────┘      └──────┬───────┘      └─────────────┘
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
        ┌──────────┐   ┌──────────┐   ┌──────────────┐
        │  Redis   │   │  Worker  │   │   Sentry /   │
        │ cache/   │   │ (BullMQ) │   │   Datadog    │
        │ limits   │   └──────────┘   └──────────────┘
        └──────────┘
              │
              ▼
   ┌──────────────────────┐
   │ Postgres primary     │──────▶ read replica(s)
   └──────────────────────┘
```

**Code touch points for Phase 1:**
- `backend/src/utils/cache.ts` → Redis adapter
- `backend/src/middleware/rateLimiter.ts` → `rate-limit-redis` store
- `backend/src/utils/loginLockout.ts` → Redis keys with TTL
- `backend/src/middleware/upload.middleware.ts` → presigned upload flow
- `backend/src/utils/postImage.ts` → CDN URL resolution instead of local serve

---

## 9. Summary

Buddy Script implements a coherent social-feed domain model with security and performance patterns appropriate for a single-instance deployment: cursor pagination, transactional writes, hashed refresh tokens, and defense-in-depth on the API boundary.

What it deliberately does **not** do — because of free-tier hosting and assignment scope — is externalize state (Redis), persist media (S3), run background workers, or provide production-grade observability and CI. Those gaps are well-defined and map to a clear, phased upgrade path without rewriting the core domain logic.

The highest-priority production change is **moving uploads off ephemeral disk**. The second is **Redis** so the API can scale horizontally without broken rate limits and inconsistent caches.
