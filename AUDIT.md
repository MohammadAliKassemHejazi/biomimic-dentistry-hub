# Biomimic Dentistry Hub — Codebase Audit

**Date:** 2026-04-21
**Scope:** Full project (client + server + infra)
**Stack:** Next.js 16 / React 19 (client), Express 5 / Sequelize-TypeScript (server), PostgreSQL 15, Redis 7, Docker Compose, Render for prod.

Severity legend: **CRITICAL** (fix before prod) · **HIGH** (fix soon) · **MEDIUM** (fix when touching area) · **LOW** (nice to have).

---

## 1. Security — CRITICAL

### 1.1 Supabase keys leaked in git history
Commit `9d32335` ("first commit") added `.env` with:
- `VITE_SUPABASE_PROJECT_ID=hgapzbqruvfxsrhrwvqw`
- `VITE_SUPABASE_URL=https://hgapzbqruvfxsrhrwvqw.supabase.co`
- `VITE_SUPABASE_PUBLISHABLE_KEY=<JWT anon key, exp 2073>`

Deleted in commit `cdc57ab` but still in git history and on GitHub. The anon key is client-exposable by design, but the project URL + anon key together let anyone with RLS misconfigured read/write data.
**Action:** delete/rotate that Supabase project (you're not using it anymore — current stack is Postgres). If still in use, rotate the anon key and audit Row-Level Security policies.

### 1.2 Hardcoded admin credentials in seed
`server/src/utils/seed.ts:7,12` — creates `admin@admin.com` / `1234554321` on every boot if missing. This is production code.
**Action:** require `SEED_ADMIN_EMAIL` and `SEED_ADMIN_PASSWORD` env vars, or remove the auto-seed entirely.

### 1.3 JWT stored in non-HttpOnly cookie (XSS exposure)
`client/src/contexts/AuthContext.tsx:77,106` calls `Cookies.set('token', token, { expires: 7 })` with no `httpOnly`, `secure`, or `sameSite` flags. Any XSS = full account takeover.
**Action:** set the JWT cookie from the server with `HttpOnly: true, Secure: true, SameSite: 'Lax'`. Do not `Cookies.set()` from JS.

### 1.4 Weak JWT fallback in Docker
`docker-compose.yml:39` — `JWT_SECRET=${JWT_SECRET:-dev_secret_key_123}`. If someone runs `docker-compose up` in prod without setting `JWT_SECRET`, they get a known secret.
**Action:** remove the fallback; fail loudly if unset.

### 1.5 Local `.env` contains a real Stripe test key
`.env:10` — `STRIPE_SECRET_KEY=sk_test_51L48azAI5O329...`. Only live-test, but it's still your tenant's key. Not in git (gitignored), but easy to leak via screen-share/backup.
**Action:** rotate the key in Stripe dashboard, replace locally with a placeholder.

### 1.6 `sync({ alter: true })` on boot
`server/src/index.ts:57` — runs whenever `NODE_ENV !== 'production'` OR `SYNC_DB=true`. `alter:true` can silently drop columns on model mismatch.
**Action:** use a migration library (`sequelize-cli` or `umzug`). Never run `alter` in prod.

### 1.7 CORS origin not validated for images
`client/next.config.ts:23-35` — `remotePatterns` accepts `hostname: '**'` for both `http` and `https`. Any remote host can be loaded via `next/image`.
**Action:** restrict to explicit allowed hosts (your CDN + localhost).

---

## 2. Server — HIGH

### 2.1 Silent DB failure on boot
`server/src/index.ts:52-64` — `sequelize.authenticate().then(...).catch(err => console.error(...))`. If the DB is unreachable, the server still starts and every request will 500.
**Action:** on DB error, `process.exit(1)` so Render/Docker restarts cleanly.

### 2.2 Admin routes partially unprotected
`server/src/routes/admin.routes.ts:15-16` — `GET /settings/partnership-kit` and `GET /settings/partner-templates` are mounted **before** `router.use(authenticate, isAdmin)` at line 18, so they're public. If these leak internal file paths or templates meant for authenticated partners, it's a data leak.
**Action:** if truly public marketing assets, rename/move to a public router. If not, move below the `router.use(authenticate, isAdmin)` line.

### 2.3 Missing validation / global error handler
`server/src/index.ts` — no `app.use((err, req, res, next) => ...)` error handler, no input-validation middleware (zod is only in client deps). Unhandled errors in controllers will be returned as raw stack traces by Express 5.
**Action:** add global error handler + input validation (zod or express-validator) at route boundary.

### 2.4 File upload: no size/mime hard limit visible at route layer
`server/src/middleware/upload.ts` handles multi-file processing with `Promise.all` — if one fails, it's unclear whether partial uploads persist. Size/mime limits need auditing per-route.
**Action:** enforce multer `limits: { fileSize, files }` per route; reject non-image mime types for image endpoints.

### 2.5 Email transporter silently fails
`server/src/utils/email.ts` — reads `EMAIL_USER` / `EMAIL_PASS` without validation. If unset in prod, password-reset / newsletter flows throw at runtime, user sees 500.
**Action:** at boot, if any "mail-using" feature is enabled, assert both vars are present.

### 2.6 Sequelize `dialectOptions.ssl.rejectUnauthorized: false`
`server/src/config/database.ts:62` — accepts any cert. Fine for Neon/Supabase managed CAs, but if you ever host Postgres yourself this is a MITM risk.
**Action:** document why (Neon uses a self-signed chain), or add the Neon CA and flip to `true`.

---

## 3. Client — HIGH / MEDIUM

### 3.1 Localhost fallbacks in production code
Multiple files hardcode `http://localhost:5000` as a fallback:
- `client/src/components/SponsorsSection.tsx:49`
- `client/src/components/VIPSection.tsx:43`
- `client/src/app/admin/page.tsx:144`
- `client/src/app/blog/[slug]/page.tsx:41`

If `NEXT_PUBLIC_API_URL` is ever empty at build time, prod bundle ships with `localhost:5000`.
**Action:** fail the build if `NEXT_PUBLIC_API_URL` is missing; remove fallbacks.

### 3.2 No refresh-token flow
JWT expires in 7 days with no refresh. Users get silently logged out, no UX affordance.
**Action:** either shorten access-token life + add a refresh endpoint, or document the 7-day design choice and show a clear re-auth prompt.

### 3.3 No CSRF protection
No CSRF tokens anywhere. With the JWT in a readable cookie (see 1.3), this is compounded. When you move to `HttpOnly` cookies, CSRF becomes critical.
**Action:** when migrating to HttpOnly cookies, add a CSRF token (double-submit cookie pattern) or rely on `SameSite: Strict`.

### 3.4 Client components fetch data without error/loading UI
`client/src/components/SponsorsSection.tsx:26-31`, `client/src/components/Footer.tsx:16` use `.then/.catch(console.error)` with no user-visible error/loading state.
**Action:** add skeletons / error boundaries or migrate to React Query (`@tanstack/react-query` is already installed) / Server Components.

### 3.5 `next/image` + wildcard remote pattern
`SponsorsSection.tsx:51` — renders user-uploaded logos with fixed 64×64 via `next/image`, but `remotePatterns: '**'` means no optimization safety.
**Action:** serve uploads through a known CDN hostname only; tighten `remotePatterns`.

---

## 4. Infra & Config

### 4.1 Port mismatch in README — MEDIUM
`README.md:69,78` references DB port `5435`; `docker-compose.yml:18` uses `5432`. New devs hit wrong port.
**Action:** update README to match.

### 4.2 Duplicate `server/docker-compose.yml` — LOW
Duplicate incomplete compose file; root version is canonical.
**Action:** delete `server/docker-compose.yml`.

### 4.3 No production Dockerfile for client — MEDIUM
Only `client/Dockerfile.dev` exists. Render deploys via `npm install && npm run build && npm start` (see `render.yaml:56-57`), so this isn't blocking — but if you ever containerize the client, you'd need a multi-stage prod Dockerfile.

### 4.4 `NODE_ENV` not set in `docker-compose.yml` server service — HIGH
Server gets no `NODE_ENV`, so Sequelize treats it as dev and runs `sync({alter:true})` (see 1.6). Even in the dev container this is fine, but it's worth locking explicitly.
**Action:** add `NODE_ENV=development` to the compose `server` service env list for clarity.

### 4.5 `render.yaml` `sync: false` secrets must be manually set
`render.yaml:17,19,27,31,33,39,44,45` — `DATABASE_URL`, `REDIS_URL`, `STRIPE_SECRET_KEY`, `PAYPAL_*`, `CLIENT_URL`, `EMAIL_*` all `sync: false` (user sets in dashboard). Nothing validates they're present before deploy — `server/src/index.ts:7` only checks `DATABASE_URL` and `JWT_SECRET`.
**Action:** extend `requiredEnvVars` in `index.ts` per feature flag.

---

## 5. Dead / Suspicious Files

- `test-db.js` — won't parse, ES decorator syntax in JS. **Delete.**
- `test-db.ts` — duplicate of above. **Delete.**
- `update_indices.py` — unfinished (ends in `pass`). **Delete or finish.**
- `server/docker-compose.yml` — duplicate, incomplete. **Delete.**
- `OPTIMIZATION_PLAN.md` — wishlist doc from start of project. Keep if still relevant, otherwise archive.

---

## 6. Dependencies

### Server
- `@types/node: ^25.2.3` — targets Node 24+; Dockerfile likely runs Node 20. **Downgrade to `^20.x`.**
- `express: ^5.2.1` — v5 is recent-stable; acceptable but fewer middleware ecosystem guarantees.
- No migration tool installed (`sequelize-cli` / `umzug`). Blocks fixing 1.6.

### Client
- `react: 19.2.3` + `next: ^16.1.6` — modern, fine.
- `zod: ^4.3.6` — listed but no usage found in `client/src/**`. Confirm it's actually used, or remove.

---

## 7. What I'd fix first (priority queue)

1. **1.1** — rotate/delete the leaked Supabase project.
2. **1.2** — remove hardcoded admin creds (or move to env).
3. **1.5** — rotate the Stripe test key that's in local `.env`.
4. **1.3 + 3.3** — migrate JWT to HttpOnly cookie + CSRF (one coherent change).
5. **1.6** — swap `sync({alter})` for real migrations before the next schema change.
6. **1.4 + 4.4** — tighten Docker secrets/env.
7. **2.1** — exit on DB connection failure.
8. **2.2** — audit admin route ordering.
9. **3.1** — remove localhost fallbacks from client components.
10. Clean up dead files (§5).

Everything else can be batched as a single "hardening" PR.
