# Architect Report — Iteration 14

**Agent:** architect  
**Date:** 2026-04-28  
**Status:** APPROVED — No conflicts

---

## Review

Both reports are correct. The cascade is:
```
DB column missing → getProfile() 500 → checkUser() catch → setUser(null) → user appears logged out
```

The primary fix eliminates the 500. The secondary FE fix closes the defensive
gap so any future transient server error doesn't evict the user's session state.

---

## BE-14-01 Architecture: Migration Runner

**Approved approach: idempotent SQL migration runner in `server/src/utils/migrate.ts`**

Rationale vs SYNC_DB=true:
- `sequelize.sync({ alter: true })` inspects every column on every table — expensive and
  potentially destructive in production (can drop/recreate constraints)
- Raw SQL `ADD COLUMN IF NOT EXISTS` is O(1) per statement, fully auditable, and
  truly idempotent — safe to run on every startup forever
- The migration runner grows with the codebase; each new column gets one line

**Complete list of columns to add (all nullable — no data migration required):**

| Table | Column | SQL type | Default |
|---|---|---|---|
| subscriptions | paypal_subscription_id | VARCHAR(255) | NULL |
| subscription_plans | paypal_plan_id | VARCHAR(255) | NULL |
| subscription_plans | icon | VARCHAR(255) | NULL |
| partnership_requests | company_name | VARCHAR(255) | NULL |
| partnership_requests | tier | VARCHAR(255) | NULL |
| partnership_requests | application_file | VARCHAR(255) | NULL |
| ambassador_applications | experience | TEXT | NULL |
| ambassador_applications | bio | TEXT | NULL |
| ambassador_applications | social_media_links | TEXT | NULL |
| ambassador_applications | cv | TEXT | NULL |
| leadership_members | linkedin | VARCHAR(255) | NULL |
| leadership_members | twitter | VARCHAR(255) | NULL |
| leadership_members | instagram | VARCHAR(255) | NULL |
| leadership_members | facebook | VARCHAR(255) | NULL |
| leadership_members | expertise | VARCHAR(255) | NULL |
| leadership_members | achievements | VARCHAR(255) | NULL |
| leadership_members | status | VARCHAR(255) | NULL |
| trusted_partners | tier | VARCHAR(255) | NULL |
| trusted_partners | website | VARCHAR(255) | NULL |
| blog_posts | images | TEXT[] | '{}' |

**Index to add:**
- `subscriptions_paypal_subscription_id` ON subscriptions(paypal_subscription_id)

**Startup placement:** `runMigrations()` must be called AFTER `sequelize.authenticate()`
but BEFORE `sequelize.sync()` and `seedDefaultAdmin()`.

---

## FE-14-01 Architecture: AuthContext guard fix

**Approved approach:**
Move `setUser(null)` inside the `isAuthFailure` guard. On 5xx/network errors,
user state is preserved (null on first load — same as before; non-null if
already loaded in session — improved). The `loading` flag is still resolved
to `false` in all cases via `finally`.

---

## Decision

| Fix | Decision |
|---|---|
| BE-14-01a | ✅ APPROVED — new `server/src/utils/migrate.ts` |
| BE-14-01b | ✅ APPROVED — call `runMigrations()` in `server/src/index.ts` startup |
| FE-14-01  | ✅ APPROVED — guard `setUser(null)` to auth-failure-only path |

**No conflicts. Proceed to PHASE 3.**
