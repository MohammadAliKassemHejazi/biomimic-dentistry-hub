# Backend Expert — Iteration 8 Investigation Report
Agent: backend-expert · Iteration 8 · 2026-04-26

---

## 🚨 P0 — BE-RESOURCE-TYPE: GET /resources returns paginated envelope, admin expects flat array

**File:** `server/src/controllers/resource.controller.ts` (lines 44–56)

**Root cause (confirmed):** The `getResources` handler always returns:
```json
{ "data": [...], "meta": { "total": N, "page": 1, "limit": 10, "totalPages": N } }
```
The admin page fetches this as `api.get<Resource[]>('/resources')` and stores the whole object.
`allResources.map` then crashes with `TypeError: allResources.map is not a function`.

**Fix options:**
- **Option A (preferred):** Add `?limit=500` in the admin fetch call AND update the admin type annotation to handle `{ data: Resource[] }` (frontend fix — lower risk, zero backend change).
- **Option B:** Add a dedicated `GET /admin/resources` endpoint that returns a flat array. This is cleaner long-term but requires a new route.

Recommendation: **Option A** — frontend-only fix. The 500-limit safely fetches all resources for the admin panel without overloading the API.

---

## SV-06 — Subscription model missing `paypalSubscriptionId` field

**File:** `server/src/models/Subscription.model.ts`

**Problem:** The webhook controller (`webhook.controller.ts`) handles PayPal subscription events but the Subscription model only has:
- `stripeSubscriptionId`
- `stripePriceId`
- `status`, `currentPeriodEnd`, `cancelAtPeriodEnd`

No `paypalSubscriptionId` column. PayPal subscription IDs (format: `I-XXXXXXXX`) cannot be stored, so lookups in the PayPal webhook handler fail silently or fall back to a DB scan.

**Fix (Subscription.model.ts):**
```typescript
@Column(DataType.STRING)
paypalSubscriptionId?: string;
```
Add to the model + add an index:
```typescript
indexes: [
  { name: 'subscriptions_user_id', fields: ['user_id'] },
  { name: 'subscriptions_stripe_subscription_id', fields: ['stripe_subscription_id'] },
  { name: 'subscriptions_paypal_subscription_id', fields: ['paypal_subscription_id'] }, // NEW
  { name: 'subscriptions_status', fields: ['status'] }
]
```
Since the project uses `sequelize.sync({ alter: true })` (no migration files), this will auto-add the column on next server start.

---

## BE-PERF-01 — getFavorites loads all BlogView rows via JOIN (N+1 equivalent)

**File:** `server/src/controllers/blog.controller.ts` (lines 263–275)

**Problem:** `getFavorites` includes:
```typescript
include: [
  {
    model: BlogPost,
    as: 'blogPost',
    include: [
      { model: User, as: 'author', attributes: ['firstName', 'lastName'] },
      { model: BlogView, as: 'views', attributes: ['id'] }   // ← loads ALL view rows
    ]
  }
]
```
For a user with 50 favorited posts, each with 10,000 views, this hydrates 500,000 BlogView rows per request. The main blog list already uses a scalar subquery (P-B1, Iter 2).

**Fix (getFavorites):** Replace the BlogView include with a Sequelize literal scalar subquery:
```typescript
import { sequelize } from '../config/database';
// In getFavorites Favorite.findAll:
include: [
  {
    model: BlogPost,
    as: 'blogPost',
    attributes: {
      include: [[
        sequelize.literal(
          '(SELECT COUNT(*)::int FROM "blog_views" AS "bv" WHERE "bv"."blog_post_id" = "blogPost"."id")'
        ),
        'viewCount',
      ]],
    },
    include: [
      { model: User, as: 'author', attributes: ['firstName', 'lastName'] }
    ]
  }
]
// In the .map():
view_count: Number((p as any).get?.('viewCount') ?? 0),
// instead of:
view_count: p.views?.length || 0,
```

---

## BE-AUTH-AUDIT — Route protection audit

**Files:** All `/server/src/routes/` files

| Route | Method | Auth | Admin | Notes |
|-------|--------|------|-------|-------|
| `/resources` | GET | ✅ `authenticate` | ❌ | Intentional: filtered by role in controller |
| `/resources/:id/download` | POST | ✅ `authenticate` | ❌ | Correct — any logged-in user |
| `/resources` | POST | ✅ `authenticate` | ❌ | Intentional: ambassadors can submit |
| `/resources/:id` | PUT | ✅ `authenticate` + ✅ `isAdmin` | ✅ | Correct |
| `/resources/:id` | DELETE | ✅ `authenticate` + ✅ `isAdmin` | ✅ | Correct |
| `/newsletter` | GET | ✅ + ✅ `isAdmin` | ✅ | Correct |
| `/newsletter/:id` | DELETE | ✅ + ✅ `isAdmin` | ✅ | Correct |
| `/contact` | GET | ✅ + ✅ `isAdmin` | ✅ | Correct |
| `/contact/:id/status` | PATCH | ✅ + ✅ `isAdmin` | ✅ | Correct |
| `/partners` | GET | ❌ (public) | ❌ | Correct — public listing |
| `/partners` | POST | ✅ + ✅ `isAdmin` | ✅ | Correct |
| `/partners/:id` | PUT/DELETE | ✅ + ✅ `isAdmin` | ✅ | Correct |
| `/courses` | GET | ❌ (public) | ❌ | Correct |
| `/courses/:id` | PUT/DELETE | ✅ + ✅ `isAdmin` | ✅ | Correct |
| `/settings/partnership-kit` | GET | ❌ (public) | ❌ | Correct — read-only public |
| `/admin/*` | ALL | ✅ + ✅ | ✅ | Correct |

**No backend auth gaps found.** All sensitive mutations are protected. The `text-white/90` issue is frontend-only.

---

## BE-SETTINGS — settings.routes.ts review

**File:** `server/src/routes/settings.routes.ts`

New file (from git status `??`). Exposes only:
```
GET /api/settings/partnership-kit
```
Returns `{ url: string | null }` from `SiteSetting` table. Public, no auth required. This is correctly scoped — the write endpoint lives in `admin.routes.ts` behind admin guard.

**Recommendation:** The file is correctly implemented. No changes needed.

---

## BE-COOKIE — Auth token delivery (HttpOnly cookie vs JS-accessible cookie)

**File:** `server/src/controllers/auth.controller.ts`, `server/src/routes/auth.routes.ts`

**Current state:** JWT is returned as JSON body. The frontend stores it in a JS-accessible cookie via `js-cookie`. This exposes the token to XSS attacks.

**Full HttpOnly + CSRF conversion would require:**
1. Server: set `res.cookie('token', jwt, { httpOnly: true, secure: true, sameSite: 'strict' })`
2. Server: add a CSRF double-submit cookie pattern
3. Client: remove `js-cookie` usage, rely on browser sending HttpOnly cookie automatically
4. Client: add `credentials: 'include'` to all fetch calls in `api.ts`
5. Client: update `getRoleFromToken()` in api.ts (currently reads from JS cookie — would need to re-read from a separate readable claim cookie or API endpoint)

**Status: Deferred** — significant cross-cutting change. Flag for a dedicated security iteration.

---

## BE-SYNC — Schema sync verification

The project uses `sequelize.sync({ alter: true })` on startup. All models with `@Table`, `@Column`, `@Index` decorators auto-sync to the DB. No migration files exist. This means:
- Adding columns (like `paypalSubscriptionId`) is safe — `alter: true` will ADD the column
- Removing columns is NOT done by `alter: true` — orphan columns accumulate
- Renaming columns would create a new column + leave the old one — must be done carefully

No immediate issues. The `paypalSubscriptionId` addition is safe.

---

## Summary of Fixes Required

| ID | Priority | File | Change |
|----|----------|------|--------|
| BE-RESOURCE-TYPE | **P0** (frontend fix) | admin/page.tsx | Frontend handles paginated response (see FE-BUG-01) |
| BE-PERF-01 | HIGH | blog.controller.ts | Replace BlogView JOIN with scalar subquery in getFavorites |
| SV-06 | MEDIUM | Subscription.model.ts | Add `paypalSubscriptionId` field + index |
| BE-SETTINGS | ✅ No change | settings.routes.ts | Already correct |
| BE-AUTH-AUDIT | ✅ No gaps | All routes | All admin mutations are protected |
| BE-COOKIE | LOW (deferred) | auth.controller.ts | HttpOnly cookie conversion — deferred |

Status: **analysis complete**
