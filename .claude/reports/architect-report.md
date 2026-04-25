# Architect — Iteration 3 Review
Agent: architect · Iteration 3 · 2026-04-25
Input: backend-report.md + frontend-report.md (Iter 3)

## Decision: APPROVED ✅

All proposed fixes are architecturally sound. No deviations from the frozen error shape
`{ message: string }` or from the existing auth/role model. Detailed notes below.

---

## §1 · Stripe webhook (SV-16a)

**Approved as specified.** Key architectural constraints:

1. **Body parser ordering** — The webhook routes must be registered in `index.ts` **before**
   `app.use(express.json())`. The global json middleware will consume the raw body before the
   route-level `express.raw()` gets a chance if registered after. Mount order matters in Express.

2. **Route-level raw parser** — `express.raw({ type: 'application/json' })` is added as
   route-level middleware on the `/stripe` and `/paypal` routes. This is the correct pattern.

3. **STRIPE_WEBHOOK_SECRET** — if not set, return 500 immediately. Never fall back to an empty
   string (that would make `constructEvent` fail with a misleading error).

4. **Idempotency** — `checkout.session.completed` must use `findOrCreate` on `userId` to avoid
   duplicate subscription rows on webhook retry. Then update if not created.

5. **Role update** — call `clearUserCache(userId)` immediately after `User.update()`.

6. **Plan key → role mapping**: `{ bronze: BRONZE, silver: SILVER, gold: VIP, vip: VIP }`.
   Gold→VIP is the existing convention. Do NOT change UserRole enum values.

---

## §2 · PayPal confirm endpoint (SV-16b)

**Approved.** Architectural constraints:

1. **Authenticated route** — `POST /api/subscriptions/paypal/confirm` must use `authenticate`.
   The `userId` comes from `req.user.id`, not from the request body, to prevent spoofing.

2. **Verify via PayPal API** — fetch the subscription from PayPal, check `status === 'ACTIVE'`
   before writing to the DB.

3. **Reuse `stripeSubscriptionId` column** — acceptable for Iter 3. Add a code comment noting the
   dual-purpose. A proper `paypalSubscriptionId` column can be added when migration tooling ships.

4. **`currentPeriodEnd` approximation** — PayPal subscriptions don't always return the next
   billing date. Use the plan's `interval` to compute an approximate date (30d / 365d).
   Acceptable for Iter 3.

---

## §3 · PayPal webhook (SV-16b continued)

**Approved with caveats:**

1. **`PAYPAL_WEBHOOK_ID` env var** — if not set, log a `console.warn` and skip signature
   verification in dev only. In production this is a security risk — document clearly.

2. **User lookup by email** — `BILLING.SUBSCRIPTION.ACTIVATED` provides `resource.subscriber.email_address`.
   Use `User.findOne({ where: { email } })`. If not found, log and break (do NOT 500 —
   PayPal will retry aggressively, causing log spam).

3. **Period end approximation** — same as confirm endpoint: use plan interval.

---

## §4 · SV-20 — getPostBySlug scalar subquery

**Approved.** Same pattern as P-B1 (Iter 2). Remove `{ model: BlogView, as: 'views' }`,
add scalar literal. Keep `BlogView` in the import (still needed for `recordView`).

---

## §5 · SV-14 — Auth user cache

**Approved.** Constraints:

1. **30s TTL** — role changes (by admin or webhook) call `clearUserCache(userId)` to invalidate
   immediately. The worst case is a 30s window where a role change isn't visible.

2. **Apply to both `authenticate` and `authenticateOptional`** — same cache Map + helper.

3. **Memory** — at 30s TTL and typical concurrency, the Map stays well under 1MB.

4. **Export `clearUserCache`** — named export from `auth.middleware.ts`. Used by webhook.controller
   and subscription.controller.

---

## §6 · U-M2 — Admin tab conditional rendering

**Approved.** Wrap each `<TabsContent>` body with `{activeTab === 'value' && ...}`.  
Data arrays (applications, users, partners, etc.) live in parent state so badge counts remain
accurate regardless of which tab is mounted.

**Note:** Default tab is `applications` — it mounts immediately on load, no layout shift for
the default view.

---

## §7 · F-W1 — Subscription page success handlers

**Approved.** Constraints:

1. Use `useSearchParams()` from `next/navigation` (component is already `'use client'`).
2. Handle in a `useEffect` that runs once on mount.
3. Call `refetch()` from `useSubscription` after Stripe success.
4. For PayPal: call `POST /api/subscriptions/paypal/confirm` first, then `refetch()`.
5. Use `router.replace('/subscription')` to clean up URL params (no history entry).

---

## §8 · Deferred items (Iter 4 candidates)

- SV-06 (migration tooling) — unblocks P-B4 composite index + proper paypalSubscriptionId column
- FE-03-full (HttpOnly cookie + CSRF) — full-stack coordinated migration
- U-M1 (HeroSection LCP) — product sign-off required

---

## Approved fix set (Iter 3, dependency-ordered)

| Order | ID     | File(s)                                                               | Priority |
|-------|--------|-----------------------------------------------------------------------|----------|
| 1     | SV-14  | server/src/middleware/auth.middleware.ts                              | MEDIUM   |
| 2     | SV-16a | server/src/controllers/webhook.controller.ts (NEW)                    | CRITICAL |
| 2     | SV-16a | server/src/routes/webhook.routes.ts (NEW)                             | CRITICAL |
| 3     | SV-16b | server/src/controllers/subscription.controller.ts                     | CRITICAL |
| 3     | SV-16b | server/src/routes/subscription.routes.ts                              | CRITICAL |
| 4     | SV-16a | server/src/index.ts (register webhook routes before express.json)     | CRITICAL |
| 5     | SV-20  | server/src/controllers/blog.controller.ts                             | HIGH     |
| 6     | U-M2   | client/src/app/admin/page.tsx                                         | MEDIUM   |
| 7     | F-W1   | client/src/app/subscription/page.tsx                                  | CRITICAL |

**Architecture review complete — GO for implementation.**
