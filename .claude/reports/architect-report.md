# Architect Report — Iteration 4
Agent: architect · Iteration 4 · 2026-04-25

## Verdict: APPROVED WITH CONDITIONS

---

## Cross-cutting review

### Cache invalidation architecture (BE-02, BE-03, BE-01c)
Both frontend and backend agents agree on the root cause. The pattern `clearCache('/api/partners/')` is the correct approach (matches how admin.controller already uses it for `/api/admin/settings/`). Approved for all three controllers.

**Condition:** Clear the cache prefix that matches the Redis key format: `cache:/api/partners/*` — the clearCache function uses `redis.keys('cache:/api/partners/*')` so the arg must match the route prefix including leading `/api/`.

### Browser cache fix (FE-01)
`cache: 'no-store'` is correct and safe. The FetchOptions interface extends RequestInit so this field is valid TypeScript. This overrides browser caching entirely for those fetches. The Redis cache is separately invalidated by BE-02/BE-03. Both layers must be cleared. APPROVED.

### Partnership auto-approval (BE-01a, FE-02)
**Contract:**
- Frontend sends: `PATCH /admin/partner-applications/:id/status` with body `{ status: 'approved', tier: string }`
- Backend reads `tier` from body, fetches the PartnershipRequest, maps fields:
  - `name` → `name` (or `companyName` if set)
  - `companyName` → `role` (e.g. "Partner Company")
  - `message` → `description`
  - `tier` (admin-chosen) → `tier`
  - logo: null initially (admin can set it later via Partners tab)
  - website: null initially

**Condition:** Use `findOrCreate` (or `upsert` based on name+tier) to prevent duplicate TrustedPartner if admin approves twice. OR: check if PartnershipRequest already has a linked TrustedPartner. Simplest: check that status is currently 'pending' before creating.

### Blog images (BE-04, FE-03)
Simple additive change. No contract conflict. The `images` field is `string[]` on the model. The API response should include it. The frontend renders it as a gallery below content. APPROVED.

### BiomimeticTooth3D replacement (FE-04)
Full replacement with CSS is the right call. Zero risk of breaking other components — it's only used in HeroSection. The CSS approach eliminates WebGL entirely. APPROVED.

### Course detail + Resource pages (FE-05, FE-06)
Backend API already exists (`GET /courses`, `GET /resources`). Frontend pages are purely additive. No API changes needed. APPROVED.

**Condition (FE-06):** The resource routes require `authenticate` middleware (`router.get('/', authenticate, getResources)`). The user said "for now do it without restrictions". Since we can't change the backend route auth here (it's a backend-owned decision), the resource list page should handle 401 gracefully (redirect to login, or show a login-required message). Do NOT remove the auth middleware from the route without backend expert sign-off.

### PWA install prompt (FE-08)
The manifest already exists. The install prompt component just needs to handle `beforeinstallprompt`. APPROVED. Keep it simple: capture the event, show a bottom banner, dismiss on close or install.

### clearUserCache on role change (BE-01b)
Critical correctness fix. The auth cache (30s TTL) means role changes in admin are invisible for up to 30s. Adding `clearUserCache(userId)` to `updateUserRole` closes this gap. APPROVED.

### Course image upload (BE-05)
Add `upload.single('featured_image')` to the POST /courses route. Low risk, matches the pattern in `/resources` and `/blog/posts`. APPROVED.

---

## Deferred (do not touch this iteration)
- FE-03-full: HttpOnly cookie + CSRF — still deferred
- SV-06: Sequelize migrations — still deferred  
- U-M1: HeroSection LCP refactor — still deferred
- getFavorites scalar subquery — still deferred

---

## Approval matrix
| Fix | Status | Condition |
|-----|--------|-----------|
| BE-01a (auto-create TrustedPartner) | APPROVED | Check status=pending before creating |
| BE-01b (clearUserCache on role change) | APPROVED | None |
| BE-01c (clearCache on approval) | APPROVED | None |
| BE-02 (partner clearCache) | APPROVED | None |
| BE-03 (leadership clearCache) | APPROVED | None |
| BE-04 (blog images in response) | APPROVED | None |
| BE-05 (course image upload) | APPROVED | None |
| FE-01 (admin cache: no-store) | APPROVED | None |
| FE-02 (approval dialog + tier) | APPROVED | None |
| FE-03 (blog images gallery) | APPROVED | None |
| FE-04 (BiomimeticTooth3D → CSS) | APPROVED | None |
| FE-05 (course detail page) | APPROVED | None |
| FE-06 (resource list + detail) | APPROVED | Handle 401 gracefully |
| FE-07 (ambassador) | NO-OP | Already fixed |
| FE-08 (PWA prompt) | APPROVED | None |
| FE-09 (course admin form) | APPROVED | None |

Status: **APPROVED WITH CONDITIONS**
