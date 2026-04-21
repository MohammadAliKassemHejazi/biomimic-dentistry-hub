# Backend Expert — Investigation Report
Agent: backend-expert · Iteration 1 · 2026-04-21
Scope: `/server` (Express 5 / Sequelize-TS / PG / Redis / Stripe / PayPal)

## Summary
Found **22 issues** in `/server`. The three most damaging: **(a)** the admin settings routes mounted above the auth guard are publicly readable; **(b)** the server does not exit on DB-auth failure so every request 500s silently; **(c)** `createCheckoutSession` trusts any `price_id` from the client, enabling a user to check out against any Stripe price in the account.

---

## 🔴 CRITICAL

### SV-01 · Admin routes partially unprotected — ordering bug
**File:** `server/src/routes/admin.routes.ts:15-18`
```ts
router.get('/settings/partnership-kit', cacheMiddleware(3600), getPartnershipKit);  // ← public
router.get('/settings/partner-templates', getPartnerTemplates);                      // ← public
router.use(authenticate, isAdmin);                                                   // ← guard only after
```
Anyone can hit `GET /api/admin/settings/partnership-kit` and `/settings/partner-templates` without a token.

**Fix:** move both under the guard OR, if intentionally public (marketing assets), rename to `/api/partnership/kit` and `/api/partnership/templates` under a public router. Safer: move under the guard.

### SV-02 · DB auth failure does not exit process
**File:** `server/src/index.ts:52-64`
```ts
sequelize.authenticate().then(...)
  .catch(err => console.error('Unable to connect to the database:', err));
app.listen(port, ...);  // ← runs regardless
```
Server starts even when the DB is unreachable; every API call crashes with an opaque 500.

**Fix:** on `.catch`, `process.exit(1)`. Let Render/Docker restart cleanly.

### SV-03 · `createCheckoutSession` accepts any `price_id` from the body
**File:** `server/src/controllers/subscription.controller.ts:36-70`
Client can supply any Stripe price — including a $0.01 test price or another tenant's price — and the server blindly passes it to `checkout.sessions.create`. Unit-price tampering.

**Fix:** resolve the plan server-side:
```ts
const plan = await SubscriptionPlan.findOne({ where: { stripePriceId: price_id } });
if (!plan) return res.status(400).json({ message: 'Invalid price_id' });
// now use plan.stripePriceId in line_items
```

### SV-04 · No global Express error handler
**File:** `server/src/index.ts` (nothing after last `app.use`)
Express 5 default error handler emits raw stack traces. Some controllers don't wrap in try/catch at all (e.g. `contact.controller.sendMessage` doesn't validate input — a bad payload will throw during `ContactMessage.create`, which IS caught, but many newer handlers aren't). Any async throw outside try/catch → un-typed 500.

**Fix:** add at the end of `index.ts`:
```ts
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled error:', err);
  const status = err.status || 500;
  const msg = process.env.NODE_ENV === 'production' ? 'Internal server error' : (err.message || 'Error');
  res.status(status).json({ message: msg });
});
```

### SV-05 · Hardcoded admin credentials seeded on every boot
**File:** `server/src/utils/seed.ts:7,12` (see also AUDIT.md §1.2)
```ts
const adminEmail = 'admin@admin.com';
const hashedPassword = await bcrypt.hash('1234554321', 10);
```
Runs in prod.

**Fix:** require `SEED_ADMIN_EMAIL` and `SEED_ADMIN_PASSWORD`; if absent, skip and log a warning.

---

## 🟠 HIGH

### SV-06 · `sync({ alter: true })` on boot
**File:** `server/src/index.ts:57`
Can silently drop columns on model drift. Per AUDIT §1.6 — documented, fixing is out-of-scope here (needs migration library). Kept on the known-bugs list.

### SV-07 · Weak JWT fallback in docker-compose
**File:** `docker-compose.yml:39`
```yaml
- JWT_SECRET=${JWT_SECRET:-dev_secret_key_123}
```
If someone deploys this compose file without setting `JWT_SECRET`, all JWTs are forgeable.

**Fix:** remove the fallback; compose interpolation will fail loudly.

### SV-08 · `stripe` client instantiated without env validation
**File:** `server/src/utils/stripe.ts:3`
```ts
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {});
```
If missing, Stripe throws on first request with an ugly error. The `as string` cast masks the TypeScript warning.

**Fix:**
```ts
const key = process.env.STRIPE_SECRET_KEY;
if (!key) throw new Error('STRIPE_SECRET_KEY is not set');
const stripe = new Stripe(key);
```

### SV-09 · `getStatus` throws if `currentPeriodEnd` is null
**File:** `server/src/controllers/subscription.controller.ts:28`
```ts
subscription_end: subscription.currentPeriodEnd.toISOString(),
```
If the DB column is nullable (which it is — no `@NotNull` on the model), `.toISOString()` blows up.

**Fix:**
```ts
subscription_end: subscription.currentPeriodEnd ? subscription.currentPeriodEnd.toISOString() : null,
```

### SV-10 · No input validation on newsletter / contact / blog create
**Files:**
- `server/src/controllers/newsletter.controller.ts:7` — only checks truthy, not email format
- `server/src/controllers/contact.controller.ts:6` — accepts `{}` and creates a row with nulls
- `server/src/controllers/blog.controller.ts:151` — only checks `title`, not content

**Fix:** reuse `isValidEmail()` in newsletter and contact; add length caps.

### SV-11 · `updatePostStatus` accepts any string for status
**File:** `server/src/controllers/blog.controller.ts:316`
```ts
if (typeof status !== 'string') return 400;
await BlogPost.update({ status: status as ContentStatus }, ...)
```
A malformed `status` is saved as-is (ENUM will reject at the DB layer with a 500). Validate against `ContentStatus` enum values first.

### SV-12 · Redis `cacheMiddleware` caches error responses
**File:** `server/src/middleware/cache.ts:26-28`
```ts
res.json = (body) => { redis.set(key, JSON.stringify(body), 'EX', durationInSeconds); return originalJson(body); }
```
If the handler writes a 500 body, that 500 is cached for `duration` seconds. Check `res.statusCode` first (< 400).

### SV-13 · Partnership-kit / partner-templates cache never invalidated on upload
**File:** `server/src/controllers/admin.controller.ts:30, 167`
After `uploadPartnershipKit` / `uploadPartnerTemplate` succeeds, the cached GET response is stale for an hour.

**Fix:** call `clearCache('/api/admin/settings/')` after upsert.

### SV-14 · `authenticate` does a DB lookup per request
**File:** `server/src/middleware/auth.middleware.ts:29`
Every API call runs `User.findByPk(...)`. Adds ~5–20ms and a DB round-trip on every single request. Acceptable for now; document as known perf issue.

### SV-15 · `User.findByPk` loads password hash into `req.user`
**File:** all controllers that touch `req.user`.
Password hash is on `req.user`, and any controller that serializes it directly could leak it. None currently do, but the default attribute list is dangerous.

**Fix:** change `authenticate` to exclude password:
```ts
const user = await User.findByPk(decoded.userId, { attributes: { exclude: ['password'] } });
```

### SV-16 · No Stripe / PayPal webhook endpoint
**Files:** `server/src/routes/subscription.routes.ts`, no `/webhooks` route anywhere.
`createCheckoutSession` and `createPayPalCheckout` redirect to the provider, but nothing listens for `checkout.session.completed` / `invoice.paid` / `BILLING.SUBSCRIPTION.ACTIVATED`. The `Subscription` row is therefore **never created**, so `GET /subscriptions/status` returns `subscribed: false` forever.

This is a functional bug — the entire subscription flow is broken end-to-end.

**Fix (scope = out of this iteration, track as architectural):** add `/api/subscriptions/webhook/stripe` and `/api/subscriptions/webhook/paypal` endpoints with signature verification. Mark as **High priority for next iteration**.

### SV-17 · `req.ip` can be spoofed without `trust proxy`
**File:** `server/src/index.ts` (missing), `server/src/controllers/blog.controller.ts:280`
Behind Render's proxy, `req.ip` returns the proxy IP unless `app.set('trust proxy', ...)` is configured. BlogView dedupe is thus incorrect.

**Fix:** `app.set('trust proxy', 1)` in `index.ts` (before routes).

### SV-18 · `express.json()` uses default 100kb limit silently
**File:** `server/src/index.ts:46`
Blog posts with embedded content > 100kb will 413. Set explicit `limit: '1mb'` (or larger for rich content) for transparency.

---

## 🟡 MEDIUM

### SV-19 · `blog.toggleFavorite` has TOCTOU race
**File:** `server/src/controllers/blog.controller.ts:197-222`
Between `findOne` and `create`, a double-click creates two Favorite rows. The `Favorite` model has no composite unique index on `(userId, blogPostId)`.

**Fix:** add a unique composite index; use `findOrCreate` or catch the unique-violation.

### SV-20 · `getPosts` loads all `BlogView` rows just to count
**File:** `server/src/controllers/blog.controller.ts:37-70`
Per post, all views load into memory, then `.length`. For a post with 10k views, that's 10k rows fetched per listing request. Use `sequelize.fn('COUNT', ...)` with a subquery or a materialized count.

### SV-21 · `req.user.id` cast to `string` in multiple places
Minor — TS would infer string because `@Column(DataType.UUID) id!: string`. Casts hide future regressions.

### SV-22 · `bcrypt.hash(password, 10)` cost factor
10 rounds is 2013-grade. 12+ is recommended for 2026. Low priority given user load.

---

## 🟢 LOW
- SV-23 `@types/node: ^25` targets Node 24+ but Dockerfile runs Node 20 — already flagged in AUDIT §6.
- SV-24 `server/docker-compose.yml` is a dead duplicate of the root one.
- SV-25 `test-db.js` / `test-db.ts` in repo root are broken; delete (AUDIT §5).

---

## Proposed fix set (awaiting team-lead approval)
I propose to apply, this iteration:
- **SV-01** (admin route ordering)
- **SV-02** (exit on DB fail)
- **SV-03** (validate price_id against SubscriptionPlan)
- **SV-04** (global error handler)
- **SV-05** (seed admin env-gated)
- **SV-07** (remove JWT fallback in compose)
- **SV-08** (Stripe fail-fast)
- **SV-09** (null-check currentPeriodEnd)
- **SV-10** (validation: newsletter, contact)
- **SV-11** (validate status enum in updatePostStatus)
- **SV-12** (cache: only 2xx)
- **SV-13** (invalidate cache on upload)
- **SV-15** (exclude password in authenticate)
- **SV-17** (trust proxy)
- **SV-18** (json limit)

Defer to follow-up iteration:
- **SV-06** migration library (big change)
- **SV-16** webhooks (big change, needs secrets + signature verification)
- **SV-14** user caching (perf pass later)
- **SV-19** composite index (migration needed)
- **SV-20** COUNT aggregation (refactor)

**Backend analysis complete.** → team-lead
