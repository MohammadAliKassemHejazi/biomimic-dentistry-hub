# Backend Expert — Iteration 2 Report
Agent: backend-expert · Iteration 2 · 2026-04-24
Scope: /server (Express 5 / Sequelize-TS / PG / Redis / Stripe)
Focus: performance + HTTP hygiene (supports SEO + admin UX stability)

## Summary
Found **11 server-side issues** impacting either (a) time-to-content for the public pages Google crawls, or (b) admin panel responsiveness. Three are Iter-1 carryovers that were never merged (SV-07, SV-11, SV-12, SV-13). The rest are new for Iter 2.

---

## 🔴 CRITICAL — Performance

### P-B1 · `getPosts` loads every `BlogView` row per post just to `.length` it
**File:** `server/src/controllers/blog.controller.ts:36-57`
`include: [{ model: BlogView, as: 'views', attributes: ['id'] }]` — for a popular post with 50k views, this materializes 50k rows per post per list request. On a 10-post page that's 500k rows moved over the wire for a render that only needs `count`.

**Fix:** use a scalar subquery via `sequelize.literal`:
```ts
attributes: {
  include: [[
    sequelize.literal(`(SELECT COUNT(*) FROM "blog_views" AS "v" WHERE "v"."blogPostId" = "BlogPost"."id")`),
    'viewCount'
  ]]
}
```
and drop the `BlogView` include from the list query. (Keep the include on the detail query if you render a view chart; otherwise swap there too.)

### P-B2 · Cache middleware stores 5xx responses as if they were valid (SV-12 carryover)
**File:** `server/src/middleware/cache.ts:24-29`
Every `res.json(body)` is unconditionally written to Redis with TTL. A cold Redis + flaky upstream → a 500 cached for 1h returned to every crawler & user.

**Fix:** only persist when `res.statusCode < 400`. Skip persist (and optionally `redis.del(key)`) on error paths.

### P-B3 · No `Cache-Control` headers on public GETs
**File:** `server/src/index.ts` + `server/src/routes/*.routes.ts`
Public list endpoints (`/api/partners`, `/api/leadership`, `/api/plans`, `/api/blog/posts?published=true`) return without `Cache-Control`. Browsers + CDN will not cache. Adding `public, max-age=300, s-maxage=600, stale-while-revalidate=86400` dramatically lowers server load and speeds up repeat navigations.

**Fix:** thin middleware `publicCacheHeaders(maxAge, sMaxAge, swr)` applied to public routes that already use `cacheMiddleware`. Don't double up with Redis on authenticated GETs.

---

## 🟠 HIGH — Correctness (Iter 1 carryovers)

### SV-07 · Weak JWT fallback in docker-compose (carryover)
**File:** `docker-compose.yml:39`
Still reads `JWT_SECRET=${JWT_SECRET:-dev_secret_key_123}`. Remove the `:-...` default.

### SV-11 · `updatePostStatus` accepts any string (carryover)
**File:** `server/src/controllers/blog.controller.ts:316-322`
Still only checks `typeof status === 'string'`. Must validate against `Object.values(ContentStatus)`.

### SV-13 · Partnership-kit / partner-template cache never invalidated (carryover)
**File:** `server/src/controllers/admin.controller.ts`
`uploadPartnershipKit` and `uploadPartnerTemplate` must call `clearCache('/api/admin/settings/')` after upsert.

### P-B4 · N+1 on `getPosts` favorite include
**File:** `server/src/controllers/blog.controller.ts:39-47`
`include` of `Favorite` with per-user `where` triggers a scan per row. Keep the include (needed for `is_favorited`) but add a composite index on `Favorite(userId, blogPostId)` — already recommended in Iter 1 SV-19. Defer migration, but flag here because of UX impact on logged-in users browsing blog list.

---

## 🟠 HIGH — Performance (new)

### P-B5 · `/uploads` static served from Express with no `immutable`
**File:** `server/src/index.ts:51-53`
`maxAge: '1d'` is fine, but uploads are content-addressed (random filenames from multer). Use `immutable` so browsers skip revalidation for the cache lifetime.

```ts
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads'), {
  maxAge: '30d',
  immutable: true,
  etag: true,
}));
```

### P-B6 · `compression()` uses defaults; brotli skipped
Not actually a fix needed — Node `compression` package doesn't support brotli (that requires a reverse proxy). Document that Render/Nginx should terminate brotli.

### P-B7 · Sequelize pool `max: 5` in production is tight
**File:** `server/src/config/database.ts:52-58`
Neon free-tier limit is 10 connections shared. `max:5` per instance is safe, but if you scale to 2 instances you hit the limit. Document; don't change yet.

---

## 🟡 MEDIUM — Observability

### P-B8 · No request timing logged
No `morgan` or equivalent. Without p95 latency per route, you can't prove perf wins post-deploy. Add minimal `morgan('tiny')` or a 1-line custom middleware.

---

## Proposed fix set (Iteration 2, backend)
Apply this iteration:
- **P-B1** (getPosts subquery COUNT)
- **P-B2** (cache only 2xx) — also satisfies SV-12
- **P-B3** (public Cache-Control middleware)
- **P-B5** (immutable uploads)
- **P-B8** (request timing middleware)
- **SV-07** (docker-compose JWT fallback — carryover)
- **SV-11** (status enum validation — carryover)
- **SV-13** (clearCache on partner settings upload — carryover)

Defer:
- **P-B4** composite index (needs migration library)
- **P-B7** pool tuning (observe first)

**Backend iter-2 analysis complete.** → team-lead
