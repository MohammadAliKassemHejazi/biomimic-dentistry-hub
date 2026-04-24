# Architect — Iteration 2 Review
Agent: architect · Iteration 2 · 2026-04-24
Inputs: frontend-report.md (23 issues), backend-report.md (11 issues)
Mode: Read-only until team-lead grants write approval

## Verdict: **APPROVED — NO CONFLICTS**
All three lenses (performance, SEO, UX/UI) compose cleanly. One cross-stack contract needs care: `metadataBase` on the client must align with the server's `CLIENT_URL` env, and the new public `Cache-Control` headers must not conflict with the existing Redis `cacheMiddleware` TTLs.

---

## 1. Cross-stack contract checks

### 1.1 `metadataBase` ↔ `CLIENT_URL`
Client's new `metadataBase` should read from `NEXT_PUBLIC_SITE_URL`. Server already reads `CLIENT_URL` for CORS. These must be the same host in prod. **Guardrail:** add `NEXT_PUBLIC_SITE_URL` to `render.yaml` client env block. Fall back to `new URL('https://biomimeticdentistry.org')` literal only if unset. If ambiguous, `env.ts` should throw at runtime (consistent with Iter-1 architect decision #3).

### 1.2 Redis cache TTL vs HTTP `Cache-Control` `max-age`
Currently `cacheMiddleware(3600)` is used on `GET /api/admin/settings/partnership-kit` (now guarded by admin auth — no longer public, so fine). For public routes we're adding `publicCacheHeaders`, the two should not both apply to the same route. **Guardrail:** never stack `cacheMiddleware` + `publicCacheHeaders` on the same route. Public routes → `publicCacheHeaders` + optional Redis. Private routes → no HTTP cache, Redis only if specifically warranted.

### 1.3 Blog detail: server-rendered metadata + client-rendered body
Current `/blog/[slug]/page.tsx` is `'use client'`. To add `generateMetadata`, split into:
- `/blog/[slug]/page.tsx` — server component, runs `generateMetadata`, renders `<BlogPostClient slug={slug} />`
- `/blog/[slug]/BlogPostClient.tsx` — existing client body
The server component fetches once against the API to build metadata; the client refetches for interactive state (favorite button). **Guardrail:** server-side fetch must use `cache: 'force-cache'` (or `next: { revalidate: 60 }`) so crawlers don't double-hit the DB.

### 1.4 `remotePatterns` allow-list ↔ admin Partnership Kit uploads
When SV-01 guarded `/admin/settings/partnership-kit` in Iter 1, public `SponsorsSection` gracefully handles the 401. Narrowing `remotePatterns` now further removes surface area. Partner logos stored under `/uploads/*` go via Next.js rewrite, not `remotePatterns`, so the allow-list can be extremely tight: `localhost`, the app's own prod host, and the CDN (TBD). **Guardrail:** keep `http://localhost` entry for dev. Drop all `**` wildcards.

### 1.5 Sitemap generation ↔ backend endpoints
`sitemap.ts` should hit `/api/blog/posts?published=true&page=1&limit=1000`. **Guardrail:** route must not require auth — it already doesn't. Backend should return stable `slug`+`updatedAt` fields. `getPosts` already returns `slug` and `created_at`. For sitemap `lastmod`, add `updatedAt` to the response mapper. One-line server change.

### 1.6 Error-response contract (frozen from Iter 1)
`{ message: string }` remains the single error shape. New request-timing middleware (P-B8) must not emit alternative error JSON. ✅ — it's a timing logger only.

---

## 2. SOLID spot-check (Iter 2 deltas)

| Principle | Finding |
|-----------|---------|
| **S**RP | New `publicCacheHeaders` middleware is single-purpose ✅. `env.ts` on client is single-purpose ✅. New `BlogPostClient.tsx` split puts data-fetching (server) and interactivity (client) in distinct components ✅ — actually improves SRP. |
| **O**CP | `describeError(err)` helper for admin toasts is reusable, opens for new error shapes without controller edits ✅. |
| **L**SP | N/A |
| **I**SP | Admin page `Promise.all` → `Promise.allSettled` loosens the dependency: each panel state is independent ✅. |
| **D**IP | Sitemap depends on an interface (the list endpoint contract), not a concrete DB query ✅. |

No SOLID red flags.

---

## 3. Consolidated Iter-2 Fix Plan (dependency-ordered)

### Batch P — Performance (can apply in parallel with S)
1. **P-H1** `client/src/lib/env.ts` — single throwing env helper (unblocks P-C1 cleanup)
2. **P-C1** `next.config.ts` — tighten `remotePatterns`, add `optimizePackageImports`
3. **P-H2** / **P-H3** / **P-H5** — next.config + layout viewport
4. **P-H4** Footer → api helper
5. **P-B1** getPosts subquery COUNT
6. **P-B2** cache middleware only 2xx (also satisfies SV-12)
7. **P-B3** public Cache-Control middleware
8. **P-B5** immutable uploads
9. **P-B8** request timing middleware

### Batch S — SEO (parallel with P)
1. **S-C1** `layout.tsx` metadata overhaul (metadataBase, OG, twitter, icons, robots, verification hooks)
2. **S-M3** canonical URLs on all pages
3. **S-C2** `sitemap.ts` + `robots.ts` (delete `public/robots.txt` after robots.ts lands)
4. **S-C3** blog detail `generateMetadata` + client split
5. **S-M1** page-level metadata on `/about`, `/contact`, `/courses`, `/resources`, etc.
6. **S-M2** JSON-LD: `Organization` on layout, `BlogPosting` on blog detail

### Batch U — UX/UI (blocked only by env.ts from Batch P)
1. **U-H1** Admin `Promise.allSettled` (also carryover FE-05)
2. **U-H2** Admin `describeError(err)` toast helper
3. **U-H3** Skip link + nav aria-labels
4. **U-H4** not-found entity fix
5. **U-H5** Dashboard skeleton loader
6. **U-H6** Login/subscription toast descriptions (carryover FE-14/15)
7. **U-M3** site.webmanifest + apple-touch-icon link
8. **U-L4** Define missing CSS vars

### Batch K — Iter-1 carryover (backend)
1. **SV-07** drop JWT fallback in compose
2. **SV-11** updatePostStatus enum validation
3. **SV-13** clearCache on partner-settings upload

### Deferred to Iter 3
- **P-B4** composite index on Favorite (needs migration)
- **P-B7** pool tuning (observe first)
- **U-M1** hero static-first refactor (needs product sign-off)
- **U-M2** admin tab mount-on-enter

---

## 4. Architect decisions (binding for Iter 2)

1. **metadataBase** reads from `NEXT_PUBLIC_SITE_URL` via `env.ts`. If unset, fall back to a hard-coded prod URL literal (NOT a localhost fallback).
2. **sitemap.ts** uses the blog list endpoint at build+revalidate (not SSR-per-request). Revalidate every 1 hour (`export const revalidate = 3600`).
3. **robots.ts** replaces `public/robots.txt`. After robots.ts is live, delete the static file (do both atomically in the same PR).
4. **blog detail split**: server `page.tsx` + client `BlogPostClient.tsx`. Server fetch uses `next: { revalidate: 300 }`.
5. **Cache-Control** for public routes: `public, max-age=300, s-maxage=600, stale-while-revalidate=86400`. Never applied together with existing `cacheMiddleware` on the same route.
6. **Image allow-list**: `localhost` (dev), plus `NEXT_PUBLIC_SITE_URL` host if present. Explicit `hostname: 'biomimeticdentistry.org'` is the fallback literal.
7. **No new npm dependencies** this iteration. All perf wins must be config-only or stdlib-based.
8. **JSON-LD** inlined via `<script type="application/ld+json" dangerouslySetInnerHTML>` — no new react-ld lib.

---

**Architecture review complete — APPROVED.** → team-lead
