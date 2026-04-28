# Iteration 14 — Fix DB Schema Drift: Missing Columns + Auth Session Stability

**Team:** team-lead + backend-expert + frontend-expert + architect + qa-tester  
**Scope:** BE-14-01 (missing DB columns across 8 tables), FE-14-01 (logout on 500)  
**Status:** ✅ 3/3 fixes applied — MERGED  
**Date:** 2026-04-28

---

## Executive Summary

The production database was missing columns that were added to Sequelize models
after the initial deployment (PayPal support, partnership forms, leadership
profiles, etc.). The `sequelize.sync({ alter: true })` that would normally add
them is gated behind `SYNC_DB=true`, which was never set after those model
changes. The cascading result: every query joining the `subscriptions` table
threw a hard DB error (42703), `GET /api/users/profile` returned 500, and the
frontend auth context interpreted that 500 as a session eviction, logging the
user out on every page refresh.

Three fixes were applied: (1) a permanent idempotent SQL migration runner that
adds ALL missing columns on every server startup, (2) wiring it into the
startup chain before seed, and (3) a frontend defensive fix so server 500s
never evict a valid user session.

---

## What Changed — by Lens

### 🔑 Functional

| Fix ID | Summary | Files |
|---|---|---|
| BE-14-01a | Created idempotent migration runner — adds 20 missing columns across 8 tables | `server/src/utils/migrate.ts` (new) |
| BE-14-01b | Wired `runMigrations()` into startup chain before seed | `server/src/index.ts` |
| FE-14-01  | `setUser(null)` now only fires on 401/403 — 500s preserve session state | `client/src/contexts/AuthContext.tsx` |

### 🔒 Security / Reliability

| Fix ID | Summary | Files |
|---|---|---|
| FE-14-01 | Token cookie never removed on 5xx — prevents accidental session eviction | `client/src/contexts/AuthContext.tsx` |

---

## Columns Added by Migration (all idempotent — IF NOT EXISTS)

| Table | Column | Type |
|---|---|---|
| subscriptions | paypal_subscription_id | VARCHAR(255) |
| subscriptions | (index) subscriptions_paypal_subscription_id | — |
| subscription_plans | paypal_plan_id | VARCHAR(255) |
| subscription_plans | icon | VARCHAR(255) |
| partnership_requests | company_name | VARCHAR(255) |
| partnership_requests | tier | VARCHAR(255) |
| partnership_requests | application_file | VARCHAR(255) |
| ambassador_applications | experience | TEXT |
| ambassador_applications | bio | TEXT |
| ambassador_applications | social_media_links | TEXT |
| ambassador_applications | cv | TEXT |
| leadership_members | linkedin | VARCHAR(255) |
| leadership_members | twitter | VARCHAR(255) |
| leadership_members | instagram | VARCHAR(255) |
| leadership_members | facebook | VARCHAR(255) |
| leadership_members | expertise | VARCHAR(255) |
| leadership_members | achievements | VARCHAR(255) |
| leadership_members | status | VARCHAR(255) |
| trusted_partners | tier | VARCHAR(255) |
| trusted_partners | website | VARCHAR(255) |
| blog_posts | images | TEXT[] DEFAULT '{}' |

---

## New Required Env Vars

None. `SYNC_DB=true` is explicitly NOT required — migrations handle column
additions automatically and safely without it.

---

## Files Changed

### New files (1)
- `server/src/utils/migrate.ts`

### Modified files (2)
- `server/src/index.ts`
- `client/src/contexts/AuthContext.tsx`

---

## Architecture Notes

- **Migration runner pattern**: `migrate.ts` is the authoritative record of
  all schema changes post-initial-deploy. Every future model column addition
  must add a corresponding entry here. This replaces the fragile
  "remember to set SYNC_DB=true" workflow.
- **`sequelize.sync({ alter: true })` is NOT removed** — it still runs in
  dev and when `SYNC_DB=true` is explicitly set. The migration runner and
  sync are complementary: migrations patch production; sync keeps dev fresh.
- **The migration runs before seed** — this is critical; `seedDefaultAdmin`
  does DB writes that depend on the schema being complete.
- **AuthContext defensive fix**: On first load with server unreachable, user
  is still null (same UX). The improvement is mid-session: if the server has
  a transient 500 during a background profile re-check, the user stays logged
  in and their UI state is preserved.

---

## Arbitration Decisions

None required.

---

## Deferred (Iteration 15 Candidates)

| ID | Description | Why deferred |
|---|---|---|
| SEC-CSP | Content-Security-Policy header | Requires full inline-script audit |
| PWA-ICONS | Dedicated maskable icon | Low urgency |
| FE-BLOG-RT | Tiptap rich-text editor | Feature work |
| BE-COOKIE | HttpOnly cookie + CSRF token | Security hardening sprint |
| FE-LCP-BG | Convert heroBg to Next.js Image | Performance |
| ANIM-COUNTER | Count-up animation for hero stats | Enhancement |
| ANIM-CURSOR | Custom cursor on hero section | Enhancement |

---

## Cumulative Project Health

| Metric | Before Iter 14 | After Iter 14 |
|---|---|---|
| GET /api/users/profile | ❌ 500 (missing column) | ✅ 200 |
| Admin page | ❌ Errors on load | ✅ Works |
| User logged out on refresh | ❌ Yes (500 cascades) | ✅ No |
| DB schema drift | ❌ 20+ columns missing | ✅ All present |
| TypeScript errors | 0 | 0 |
| Session eviction on 5xx | ❌ Yes | ✅ No (defensive fix) |
