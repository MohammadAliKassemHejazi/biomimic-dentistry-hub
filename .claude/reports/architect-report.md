# Architect — Cross-Stack Review
Agent: architect · Iteration 1 · 2026-04-21
Inputs: frontend-report.md (19 issues), backend-report.md (22 issues)
Mode: Read-only until team-lead grants write approval

## Verdict: **CONFLICTS FOUND → RESOLVED**
No fix set collides. Two cross-cutting concerns need shared contracts. Below: the reconciled plan in dependency order, with conflict notes and architectural guardrails.

---

## 1. Cross-stack contract checks

### 1.1 Auth / token flow
- **FE-03** (add cookie `secure` + `sameSite`) is a client-only change; it does **not** require the backend to change the JWT issuance path in this iteration. The backend still returns `access_token` in JSON; the client still sets the cookie. ✅ non-conflicting.
- **Deferred:** the proper fix (HttpOnly cookie set by server + CSRF token) requires both sides to change at once. Keep for iteration 2.

### 1.2 Subscription / billing
- **SV-03** (validate `price_id` server-side against `SubscriptionPlan` table) + **FE-07** (Stripe same-tab redirect) are independent. ✅
- **SV-16** (Stripe/PayPal webhooks missing) is the *real* cause of `subscriptionStatus.subscribed` never flipping to `true` on the client. Frontend is correct; backend is incomplete. Document as a known functional gap for iteration 2; do **not** change the frontend to work around it (that would hide the real bug).

### 1.3 Admin dashboard contract
- **FE-05** (`Promise.allSettled`) + **SV-01** (admin settings routes guarded) don't conflict, but: when SV-01 is applied, **two endpoints** the client currently hits unauthenticated (`/admin/settings/partnership-kit` and `/admin/settings/partner-templates`) will start 401'ing for non-admins.
  - Frontend callers of `/admin/settings/partnership-kit`:
    - `SponsorsSection.tsx:31` — called only `if (isAuthenticated)` → when non-admin logs in, this returns 401. Currently uses `skipErrorHandling: true` → silent fail. ✅ graceful.
    - `admin/page.tsx:173` — only loaded when `user?.role === 'admin'` (line 155-160). ✅ OK.
  - **Impact:** no UX regression. Safe to apply SV-01.

### 1.4 Role model (the `gold` legacy)
- FE-09 (drop `'gold'` branches) and `admin.controller.updateUserRole` (validRoles excludes `'gold'`) agree. Enum `UserRole` doesn't list `'gold'` either. The only reason those branches exist is historical data. Apply FE-09 after confirming DB has no rows with `role='gold'`. **Architect-mandated guardrail:** keep the `user.role === 'gold' ? 'vip' : user.role` remap in `AuthContext.signIn/signUp/checkUser` (one place) so if a legacy JWT leaks in, it's normalized. Drop the `'gold'` arms *everywhere else*.

### 1.5 Error contracts
- Adding a **global Express error handler (SV-04)** formalizes the `{ message: string }` shape the client already assumes in `api.ts:78-85` (it parses `errorData.message || errorData.error`). ✅ compatible. No frontend change required.
- **Architect-mandated guardrail:** keep the JSON shape exactly `{ message: string, status?: number }`. Don't introduce `error` field; the client looks for `message` first.

### 1.6 Newsletter validation (SV-10)
When backend starts rejecting malformed emails with 400, `Footer.tsx:23` handles it by branching on `res.status === 409` (conflict). A 400 would fall into `setSubscribeStatus('error')` — generic "Something went wrong". Not ideal but not wrong. Optional frontend polish: if `res.status === 400`, show "Please enter a valid email". **Not required** for correctness.

### 1.7 `trust proxy` + blog view dedupe (SV-17)
Pure backend change. Frontend `recordView` keeps posting on every auth'd view; server now dedupes correctly. Combined with **FE-06** (drop `isAuthenticated` gate), guests now get deduped-per-IP view counts as the model intended. ✅ Complementary.

### 1.8 Localhost fallback centralization (FE-02)
Creating `client/src/lib/env.ts` that throws on missing `NEXT_PUBLIC_API_URL` can break `next build` in CI if the pipeline doesn't set the var. **Guardrail:** throw at **runtime** (module-top), not in a build-time check. Next.js 16 inlines `process.env.NEXT_PUBLIC_*` at build time, so the value is a literal in the bundle; if unset, it's literally `undefined` and the throw fires only when a page first imports `env.ts` — acceptable. Render's `render.yaml` does declare `NEXT_PUBLIC_API_URL`, so this is safe.

---

## 2. SOLID compliance spot-check

| Principle | Finding |
|-----------|---------|
| **S**RP | `auth.middleware.ts` is tight and single-purpose. `admin.controller.ts` is a fat controller (~280 LOC, 10 concerns) — accept for this pass; split in future refactor. |
| **O**CP | Controllers have inline validation + DB logic. Suggest extracting a `validate(schema)` middleware (zod already in client deps; can add to server). Defer. |
| **L**SP | N/A — no subclassing. |
| **I**SP | FE-01 hook was literally an interface segregation violation (one hook pretending to be both source and consumer of role). The fix restores ISP. ✅ |
| **D**IP | `auth.middleware` depends on concrete `User` model — acceptable; no domain service layer. |

No SOLID red flags introduced by the proposed fixes.

---

## 3. Consolidated Fix Plan (priority-ordered, dependency-aware)

### Batch A — Foundation (must merge first; unblocks B)
- **SV-02** exit-on-DB-fail
- **SV-04** global error handler
- **SV-08** Stripe fail-fast
- **SV-17** `app.set('trust proxy', 1)`
- **SV-18** `express.json({ limit: '1mb' })`

### Batch B — Security & correctness (independent of A's ordering but benefits from A's error handler)
- **SV-01** reorder admin routes
- **SV-05** seed admin env-gated
- **SV-07** remove weak JWT fallback in docker-compose
- **SV-15** exclude password in `authenticate`
- **SV-03** validate price_id against SubscriptionPlan
- **SV-09** null-check `currentPeriodEnd`
- **SV-10** validate newsletter + contact input
- **SV-11** validate `status` enum in `updatePostStatus`
- **SV-12** cache only 2xx responses
- **SV-13** invalidate cache on upload

### Batch C — Frontend (parallel with B, no dep)
- **FE-01** real `useUserRole`
- **FE-02** env helper + remove localhost fallbacks
- **FE-03** cookie flags (`secure`, `sameSite`)
- **FE-04** `remotePatterns` allow-list
- **FE-05** `Promise.allSettled` in admin page
- **FE-06** drop `isAuthenticated` on view record
- **FE-07** Stripe same-tab redirect
- **FE-08** delete dead `supabase.ts`
- **FE-10** cleanup flag in `checkUser`
- **FE-14 / FE-15** toast body text

### Deferred (next iteration)
- **SV-06** sequelize migrations (architectural)
- **SV-16** Stripe/PayPal webhooks (functional gap, biggest customer impact — elevate to iter-2 P0)
- **SV-14 / SV-19 / SV-20** perf & race polish
- **FE-03-full** HttpOnly-cookie migration + CSRF

---

## 4. Architect decisions (binding)

1. **Contract frozen:** error responses remain `{ message: string }`; do not add an `error` field.
2. **Enum normalization** for `role='gold' → 'vip'` lives **only** in `AuthContext.tsx`. Drop it everywhere else.
3. **`env.ts` (FE-02)** throws at module-import time, not build time. Fine for Render and Docker given both set the var.
4. **Deletion of `client/src/lib/supabase.ts`**: verified no `import * from '@/lib/supabase'` under `client/src/**`. Safe to delete.
5. **`SubscriptionPlan`-backed price_id validation (SV-03)** is the canonical source of truth. Do not maintain an in-memory allow-list.
6. **No new npm dependencies** this iteration. Validation stays in `utils/validation.ts`.

---

**Architecture review complete — CONFLICTS FOUND but all RESOLVED. Fix plan APPROVED for team-lead presentation.** → team-lead
