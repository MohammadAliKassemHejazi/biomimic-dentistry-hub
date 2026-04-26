# Iteration 8 — Admin Edit Forms, Performance & Accessibility

**Team:** team-lead + frontend-expert + backend-expert + architect + qa-tester
**Scope:** Admin edit forms, getFavorites perf, three.js cleanup, WCAG contrast, LCP fix, requiredRole coverage, PayPal subscription model, blog status route
**Status:** ✅ 13/13 items applied — MERGED
**Date:** 2026-04-26

---

## Executive Summary

The most critical fix this iteration resolves a P0 runtime crash on the admin Content tab: `allResources.map is not a function` — caused by the admin page treating the paginated API envelope `{ data: [], meta: {} }` as a flat array. Beyond the P0, this iteration delivered full CRUD for admin course and resource management (edit pages), eliminated 285 KB of unused Three.js JavaScript, fixed WCAG color contrast failures in the navigation, reduced LCP by removing a hero h1 animation delay, and replaced an N+1-equivalent BlogView JOIN in `getFavorites` with a scalar subquery. A pre-existing bug (`updatePostStatus` imported but never defined) was also caught and fixed during TypeScript compilation.

---

## What Changed — by Lens

### 🔑 Functional

| Fix ID | Summary | Files |
|--------|---------|-------|
| FE-BUG-01 | Fixed P0 crash: allResources.map — admin Content tab now loads correctly | `client/src/app/admin/page.tsx` |
| FE-EDIT-01 | New course edit page — pre-populated form, PUT /courses/:id | `client/src/app/admin/courses/[id]/edit/page.tsx` (NEW) |
| FE-EDIT-01b | Edit button added to Courses card in admin Content tab | `client/src/app/admin/page.tsx` |
| FE-EDIT-02 | New resource edit page — JSON body, PUT /resources/:id | `client/src/app/admin/resources/[id]/edit/page.tsx` (NEW) |
| FE-EDIT-02b | Edit button added to Resources card in admin Content tab | `client/src/app/admin/page.tsx` |
| BE-BLOG-STATUS | Added missing `updatePostStatus` controller function (pre-existing TS error) | `server/src/controllers/blog.controller.ts` |
| SV-06 | Added `paypalSubscriptionId` field + index to Subscription model | `server/src/models/Subscription.model.ts` |

### 🔒 Security

| Fix ID | Summary | Files |
|--------|---------|-------|
| FE-AUTH-01 | Added `requiredRole: 'admin'` to 19 admin API mutation call sites | `client/src/app/admin/page.tsx` |
| FE-FORM-DUP-01 | Fixed duplicate name="logo"/"image" FormData collision in Partners/Leadership dialogs | `client/src/app/admin/page.tsx` |

### 🚀 Performance

| Fix ID | Summary | Files |
|--------|---------|-------|
| BE-PERF-01 | getFavorites: replaced BlogView JOIN (N+1 rows) with scalar subquery COUNT | `server/src/controllers/blog.controller.ts` |
| FE-THREE-JS | Uninstalled three, @react-three/fiber, @react-three/drei — eliminated 285 KB unused JS | `client/package.json`, `client/package-lock.json` |
| FE-LCP | Removed h1 animation delay (0.1 → 0) to reduce LCP time | `client/src/components/HeroSection.tsx` |

### 🎨 UX / Frontend

| Fix ID | Summary | Files |
|--------|---------|-------|
| FE-CONTRAST | Fixed WCAG contrast failure: text-white/90 → text-white on nav (all 8 occurrences) | `client/src/components/Navigation.tsx` |

### 🧹 Cleanup

| Fix ID | Summary | Files |
|--------|---------|-------|
| FE-THREE-JS | Removed 51 orphaned Three.js packages from node_modules | `client/package.json` |

---

## New Required Env Vars

None

---

## Files Changed

### New files (2)
- `client/src/app/admin/courses/[id]/edit/page.tsx` — Course edit page
- `client/src/app/admin/resources/[id]/edit/page.tsx` — Resource edit page

### Modified files (6)
- `client/src/app/admin/page.tsx` — FE-BUG-01, FE-AUTH-01, FE-FORM-DUP-01, FE-EDIT-01b, FE-EDIT-02b
- `client/src/components/Navigation.tsx` — FE-CONTRAST (text-white/90 → text-white)
- `client/src/components/HeroSection.tsx` — FE-LCP (h1 delay: 0.1 → 0)
- `client/package.json` — FE-THREE-JS (removed three, @react-three/fiber, @react-three/drei)
- `server/src/controllers/blog.controller.ts` — BE-PERF-01 (getFavorites scalar subquery) + BE-BLOG-STATUS (added updatePostStatus)
- `server/src/models/Subscription.model.ts` — SV-06 (paypalSubscriptionId + index)

---

## Architecture Notes

**Resource API contract:** `GET /resources` always returns a paginated envelope `{ data: T[], meta: {} }`. Admin consumers must use `?limit=500` and extract `.data`. Do NOT change the server shape — clients adapt.

**Resource edit: JSON only.** `PUT /resources/:id` has no `upload.single` middleware. Resource edit pages must use a JSON body. File replacement for resources requires a separate backend change (deferred).

**Scalar subquery pattern:** Three controllers now consistently use the subquery COUNT pattern for view_count: `getPosts`, `getPostBySlug`, and `getFavorites`. All use `"BlogPost"."id"` for top-level queries and `"blogPost"."id"` for nested association queries (Sequelize alias, not table name).

**PayPal subscription:** `alter: true` sync adds `paypal_subscription_id` column on next server start. No data loss risk. Existing rows get NULL for the new optional column.

---

## Arbitration Decisions

| Decision | Reasoning |
|----------|-----------|
| Resource fix: frontend only (no new backend endpoint) | Server contract is correct — paginated envelope is intentional. Client adapts, not server. Option A (frontend only) has zero backend risk. |
| Resource edit: JSON body, no file upload | `PUT /resources/:id` lacks upload middleware. Adding file upload to PUT is a separate backend change outside this iteration's scope. |
| Edit links use `course.id` / `res.id`, not slug | PUT routes are `/:id` (UUID), not `/:slug`. Using slug would require extra lookup on server. |
| `logo_url` / `image_url` field promotion pattern | Cleanest way to dedup FormData without requiring server changes. Server always receives at most one `logo` or `image` key. |

---

## Deferred (Iteration 9 Candidates)

| ID | Description | Why deferred |
|----|-------------|--------------|
| FE-BLOG-RT | Tiptap rich-text editor for blog create page | Significant new feature — requires TiptapEditor component, image upload integration |
| BE-COOKIE | HttpOnly cookie + CSRF token for JWT | Cross-cutting security refactor affecting all auth flows, client storage, and server middleware |
| FE-LCP-BG | Convert heroBg CSS background to Next.js `<Image priority>` | Requires significant layout refactoring (absolute positioning, aspect ratio) — out of scope for quick LCP win |
| FE-LOGO | Partner logo "replace hint" when existing logo URL is non-image | Low priority UX improvement |

---

## Cumulative Project Health

| Metric | Before Iter 8 | After Iter 8 |
|--------|---------------|--------------|
| Admin Content tab | ❌ Crashes (TypeError: .map) | ✅ Loads correctly |
| Course CRUD | Create only | ✅ Create + Edit |
| Resource CRUD | Create only | ✅ Create + Edit |
| Unused JS (three.js) | ~285 KB shipped | ✅ 0 KB (uninstalled) |
| Nav WCAG contrast | ❌ text-white/90 (fails 4.5:1) | ✅ text-white (passes 4.5:1) |
| getFavorites query | N+1 (hydrates all BlogView rows) | ✅ O(1) scalar subquery |
| LCP h1 delay | 0.1s animation delay | ✅ 0s (immediate paint) |
| Admin API auth (client) | Partial (19 call sites unguarded) | ✅ All call sites guarded |
| FormData collision | Duplicate name="logo"/"image" | ✅ Unique names + promotion |
| PayPal subscription storage | ❌ No column (lookup fails) | ✅ paypalSubscriptionId + index |
| TypeScript (client) | ✅ 0 errors | ✅ 0 errors |
| TypeScript (server) | ❌ 1 error (missing updatePostStatus) | ✅ 0 errors |
| Lighthouse Performance | ~85 | Expected: 90+ (three.js + LCP fixes) |
| Lighthouse Accessibility | ~93 | Expected: 97+ (contrast fix) |
