# Backend Expert — Iteration 3 Report
Agent: backend-expert · Iteration 3 · 2026-04-25
Scope: /server (Express / Sequelize-TS / Stripe / PayPal)
Focus: Webhooks (SV-16), view-count aggregation (SV-20), per-request cache (SV-14)

## Summary
Three issues remain from the Iter-2 deferred list. SV-16 is the single biggest **functional** gap
in the application: users can pay via Stripe/PayPal but the `Subscription` record in Postgres is
never set to ACTIVE, so `GET /api/subscriptions/status` always returns `{ subscribed: false }` and
User.role never gets promoted. The subscription UI shows the plans but completing checkout is
effectively a no-op until webhooks are handled.

---

## 🔴 CRITICAL — SV-16: No Stripe / PayPal webhook handlers

### Root cause
`POST /api/webhooks/stripe` and `POST /api/webhooks/paypal` do not exist.  
`subscription.routes.ts` only has: `GET /status`, `POST /checkout`, `POST /paypal/checkout`,  
`POST /portal`.

After Stripe checkout the subscription is created in Stripe's system, but our DB's `Subscription`
table is never updated. `getStatus` therefore always returns `subscribed: false`.

### What needs to be built (Stripe)
1. Webhook route `POST /api/webhooks/stripe` with `express.raw()` body parser (Stripe requires
   the raw body for `stripe.webhooks.constructEvent()`).
2. Handler processes:
   - `checkout.session.completed` → upsert Subscription, set status=ACTIVE, update User.role
   - `customer.subscription.updated` → patch status + currentPeriodEnd
   - `customer.subscription.deleted` → set status=CANCELED, revert User.role → USER
   - `invoice.payment_failed` → set status=PAST_DUE
3. Webhook routes must be registered in `index.ts` **before** `app.use(express.json())` so that the
   raw body parser on those specific routes takes precedence over the global json parser.

### What needs to be built (PayPal)
PayPal doesn't embed the userId in webhook events, so we need two things:
1. `POST /api/subscriptions/paypal/confirm` (authenticated) — called by the client after PayPal
   redirects back with `?subscription_id=I-xxx`. Backend fetches the PayPal sub, verifies ACTIVE,
   upserts Subscription, updates User.role.
2. `POST /api/webhooks/paypal` — handles `BILLING.SUBSCRIPTION.ACTIVATED` (looks up user by
   subscriber email) and `BILLING.SUBSCRIPTION.CANCELLED`.  
   Signature verification uses `POST /v1/notifications/verify-webhook-signature` (PayPal API).
   Requires new env var `PAYPAL_WEBHOOK_ID`.

### Plan-key → User-role mapping
Plan keys in `subscription_plans.key`: 'bronze', 'silver', 'gold'.  
UserRole enum: BRONZE, SILVER, VIP ('vip').  
Mapping: `{ bronze: BRONZE, silver: SILVER, gold: VIP, vip: VIP }`.

### Files affected
- `server/src/controllers/webhook.controller.ts` (NEW)
- `server/src/routes/webhook.routes.ts` (NEW)
- `server/src/controllers/subscription.controller.ts` (add `confirmPayPalSubscription`)
- `server/src/routes/subscription.routes.ts` (add `/paypal/confirm`)
- `server/src/index.ts` (register webhook routes before express.json)

---

## 🟠 HIGH — SV-20: `getPostBySlug` still materialises all BlogView rows

### Root cause
`blog.controller.ts` lines 110-113:
```ts
const include: any[] = [
  { model: User, as: 'author' },
  { model: BlogView, as: 'views' }   // ← loads ALL view rows per post
];
```
Response line 143:
```ts
view_count: post.views?.length || 0,
```
P-B1 (Iter 2) fixed this on the **list** endpoint but not on the **detail** endpoint.  
For a post with 50k views, `GET /api/blog/posts/:slug` pulls 50k rows every call.

### Fix
Replace the `BlogView` include with the same scalar subquery used in `getPosts`:
```ts
sequelize.literal(
  '(SELECT COUNT(*)::int FROM "blog_views" AS "bv" WHERE "bv"."blog_post_id" = "BlogPost"."id")'
)
```
Drop `{ model: BlogView, as: 'views' }` from the include array.
Response: `view_count: Number((post as any).get?.('viewCount') ?? 0)`.

### Files affected
- `server/src/controllers/blog.controller.ts` (getPostBySlug)

---

## 🟡 MEDIUM — SV-14: Auth middleware hits DB on every authenticated request

### Root cause
`auth.middleware.ts:36` — `User.findByPk(decoded.userId)` runs synchronously on every request.  
With 10 concurrent users each firing 3 requests per page load, that's 30 DB round-trips of pure
overhead, because the user record almost never changes between requests.

### Fix
Add a lightweight in-process TTL cache (30s) keyed by userId.  
- Cache miss → DB lookup → store in Map → `next()`
- Cache hit → serve from Map → `next()` (0 DB I/O)
- Export `clearUserCache(userId)` — called by the webhook controller immediately after any
  role update so the 30s window doesn't expose stale role data.

```ts
const USER_CACHE_TTL_MS = 30_000;
const userCache = new Map<string, { user: User; expires: number }>();
export function clearUserCache(userId: string): void { userCache.delete(userId); }
```

Apply the same cache to `authenticateOptional`.

### Files affected
- `server/src/middleware/auth.middleware.ts`

---

## Proposed fix set (Iteration 3, backend)
| ID     | Fix                                             | Priority |
|--------|-------------------------------------------------|----------|
| SV-16a | Stripe webhook handler                          | CRITICAL |
| SV-16b | PayPal confirm endpoint + PayPal webhook        | CRITICAL |
| SV-20  | getPostBySlug scalar subquery                   | HIGH     |
| SV-14  | Auth user cache (30s TTL)                       | MEDIUM   |

**Backend Iter-3 analysis complete.** → team-lead
