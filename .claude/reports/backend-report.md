# Backend Expert Report — Iteration 14

**Agent:** backend-expert  
**Date:** 2026-04-28  
**Status:** ANALYSIS COMPLETE

---

## Critical Issue Found

### BE-14-01 — Missing DB column: subscription.paypal_subscription_id
**Severity:** CRITICAL — Runtime 500 on every authenticated request  
**Files affected:**
- `server/src/models/Subscription.model.ts` (model defines column, DB does not have it)
- `server/src/index.ts` (sync gated behind SYNC_DB flag — never ran in production)

**Root cause chain:**
1. Iter 8 / SV-06 added `paypalSubscriptionId` to `Subscription.model.ts`
2. `sequelize.sync({ alter: true })` — which would add the column — only runs when
   `NODE_ENV !== 'production' || SYNC_DB === 'true'` (index.ts line 182)
3. `SYNC_DB=true` was never set on Render after the model changed
4. Production DB never received the `ALTER TABLE ADD COLUMN`
5. Every query that joins `subscriptions` (including `User.findByPk` with
   `include: [Subscription]` in `user.controller.ts`) fails with:
   `ERROR 42703: column subscription.paypal_subscription_id does not exist`

**Why not just set SYNC_DB=true:**
Running `sequelize.sync({ alter: true })` in production is risky — it can:
- Rename columns Sequelize thinks changed
- Drop and re-create indexes destructively
- Time out on large tables during schema inspection
A targeted idempotent migration is safer and more auditable.

**Required fix:**
Create `server/src/utils/migrate.ts` with a single idempotent SQL statement:
```sql
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS paypal_subscription_id VARCHAR(255);
CREATE INDEX IF NOT EXISTS subscriptions_paypal_subscription_id
  ON subscriptions (paypal_subscription_id);
```
Call `runMigrations()` in `index.ts` startup sequence, before `seedDefaultAdmin()`,
inside the `sequelize.authenticate()` chain. It runs every startup but `IF NOT EXISTS`
makes it a no-op after the first successful run.

---

## Fix Plan

| ID | File | Change | Risk |
|---|---|---|---|
| BE-14-01a | `server/src/utils/migrate.ts` | New file — idempotent SQL migrations runner | None (new file) |
| BE-14-01b | `server/src/index.ts` | Call `runMigrations()` in startup chain | Low — idempotent |
