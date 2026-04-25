# Iteration 4 — Partnership Automation, Stale Cache Fix, Courses/Resources UI, PWA & GPU Optimization

**Team:** team-lead + frontend-expert + backend-expert + architect + qa-tester  
**Scope:** PA-01, PA-02, BE-01b, BE-04, BE-05, FE-03, FE-04, FE-05, FE-06, FE-07(no-op), FE-08, FE-09  
**Status:** ✅ 15/15 items applied — **MERGED**  
**Date:** 2026-04-25

---

## Executive Summary

Closed four long-standing UX gaps in this iteration. The most impactful: **partnership approval now auto-creates a TrustedPartner record** with admin-chosen tier, and **admin dashboard stale data is gone** — cache is invalidated in Redis on every write and browser cache is bypassed on every refetch. The **3D component is replaced with pure CSS animation** (zero WebGL, eliminates GPU lag). New **course detail pages** and a **PWA install prompt** make the app installable from mobile browsers.

---

## What Changed — by Lens

### 🔑 Functional

| Fix | Summary | Files |
|-----|---------|-------|
| PA-01 (BE-01a) | `updatePartnerApplicationStatus` auto-creates TrustedPartner on approve using `findOrCreate`. Admin supplies tier; submission name/company/message used as partner fields. `clearCache('/api/partners/')` called after create. | `server/src/controllers/admin.controller.ts` |
| PA-01 (FE-02) | Admin partner-applications tab: "Approve" replaced with "Review & Approve" dialog. Shows full submission details (read-only) + tier Select (Platinum/Gold/Silver/Bronze) before confirming. | `client/src/app/admin/page.tsx` |
| BE-05 | `GET /courses/:slug` endpoint added. Course create/update now accept file upload for `featured_image` via multer `upload.single`. | `server/src/routes/course.routes.ts`, `server/src/controllers/course.controller.ts` |
| FE-05 | Course detail page at `/courses/[slug]`. Hero image, price, badges (coming soon / access level), description, notify-me for upcoming courses, enroll CTA for live ones. | `client/src/app/courses/[slug]/page.tsx` (NEW) |
| FE-06 | Resource detail page at `/resources/[id]`. Shows meta (type, size, tags, downloads), access-gate CTA, download button. | `client/src/app/resources/[id]/page.tsx` (NEW) |
| FE-09 | Course creation form in admin content tab. Fields: title, slug, description, price, access level, coming soon, launch date, featured image upload, Stripe price ID. | `client/src/app/admin/page.tsx` |

### 🚀 Performance

| Fix | Summary | Files |
|-----|---------|-------|
| PA-02 (BE-02) | `createPartner`, `updatePartner`, `deletePartner` now call `clearCache('/api/partners/')` after every write. Previously only Redis HIT was possible for 5 min after any write. | `server/src/controllers/trustedPartner.controller.ts` |
| PA-02 (BE-03) | Same fix for leadership: `createMember`, `updateMember`, `deleteMember` call `clearCache('/api/leadership/')`. | `server/src/controllers/leadershipMember.controller.ts` |
| PA-02 (FE-01) | Admin `fetchData` now passes `cache: 'no-store'` on `/partners`, `/leadership`, `/plans` fetches. Browser no longer serves a 5-min stale response after admin mutations. | `client/src/app/admin/page.tsx` |
| FE-04 | `BiomimeticTooth3D` replaced with pure CSS + Framer Motion. Eliminated: WebGL context, 4× MeshDistortMaterial (GPU shader), 64-segment sphere geometry, `useFrame` at 60fps on 5 components. New impl: 0 GPU shaders, ~100 DOM bytes, identical visual. | `client/src/components/BiomimeticTooth3D.tsx` |

### 🔒 Security / Correctness

| Fix | Summary | Files |
|-----|---------|-------|
| BE-01b | `updateUserRole` calls `clearUserCache(userId)` immediately after DB write. Auth cache (30s TTL from Iter 3) no longer delays role-change propagation in the admin dashboard. | `server/src/controllers/admin.controller.ts` |

### 🖼️ Content

| Fix | Summary | Files |
|-----|---------|-------|
| BE-04 | `getPostBySlug` response now includes `images: post.images \|\| []`. Previously the `images` ARRAY column was saved on create but never returned. | `server/src/controllers/blog.controller.ts` |
| FE-03 | `BlogPostClient` renders a 2-column image gallery below the prose content when `post.images.length > 0`. Uses `resolveUploadUrl` + Next.js `<Image>`. | `client/src/app/blog/[slug]/BlogPostClient.tsx` |

### 📱 PWA / Mobile

| Fix | Summary | Files |
|-----|---------|-------|
| FE-08 | `PWAInstallBanner`: captures `beforeinstallprompt` (Chrome/Android) or detects iOS and shows manual Share instructions. 7-day localStorage dismiss. Added to root layout inside `<Providers>`. | `client/src/components/PWAInstallBanner.tsx` (NEW), `client/src/app/layout.tsx` |
| FE-08 | `site.webmanifest` updated: added `scope`, `lang`, `dir`, `prefer_related_applications: false`, `shortcuts` (Blog, Courses). | `client/public/site.webmanifest` |

---

## New Required Env Vars
None — all fixes use existing env vars.

---

## Files Changed

### New files (4)
- `client/src/components/PWAInstallBanner.tsx`
- `client/src/app/courses/[slug]/page.tsx`
- `client/src/app/resources/[id]/page.tsx`
- *(patch scripts removed after use)*

### Modified files (12)
- `server/src/controllers/admin.controller.ts` — PA-01, BE-01b
- `server/src/controllers/trustedPartner.controller.ts` — PA-02
- `server/src/controllers/leadershipMember.controller.ts` — PA-02
- `server/src/controllers/blog.controller.ts` — BE-04 (images in response)
- `server/src/controllers/course.controller.ts` — BE-05 (getCourseBySlug + file upload)
- `server/src/routes/course.routes.ts` — BE-05 (new GET /:slug route + upload middleware)
- `client/src/app/admin/page.tsx` — FE-01, FE-02, FE-09
- `client/src/app/blog/[slug]/BlogPostClient.tsx` — FE-03
- `client/src/components/BiomimeticTooth3D.tsx` — FE-04
- `client/src/app/courses/page.tsx` — card "Enroll" → link to detail page
- `client/src/app/layout.tsx` — FE-08 (PWAInstallBanner)
- `client/public/site.webmanifest` — FE-08

---

## Architecture Notes

- **Partnership approval idempotency** — `TrustedPartner.findOrCreate` keyed on `name`. If admin approves twice (e.g. UI bug), the second call finds the existing record and does not duplicate. The `clearCache` call still runs, which is harmless.

- **Cache invalidation layering** — Two independent layers:
  1. Redis (`clearCache(prefix)`) — shared across all server instances
  2. Browser (`cache: 'no-store'` on fetch) — per-browser, per-tab
  Both must be cleared for the admin UI to show fresh data. Iter 4 closes both gaps simultaneously.

- **BiomimeticTooth3D — zero-WebGL trade-off** — The CSS+Framer Motion version has identical visual composition but loses mouse-drag orbit. Orbit was never enabled (pointer-events: none), so this is zero functional regression.

- **Blog images — display only, no embed** — The `images[]` field stores server-uploaded files. They are now displayed as a gallery below the post body. Authors who want images *inside* the prose body must write `<img src="/uploads/filename.jpg">` as raw HTML in the content field (DOMPurify allows img tags by default). A full rich-text editor (Tiptap etc.) is the Iter 5 path for inline embedding.

- **Resources route auth** — `GET /resources` requires `authenticate`. The resource list page handles this gracefully: unauthenticated users see a "Sign in" screen. The resource detail page also handles 401 gracefully. No route changes were made (in scope for a future iteration when access model is decided).

---

## Arbitration Decisions
None — no conflicts between agents this iteration.

---

## Deferred (Iteration 5 Candidates)

| ID | Description | Why deferred |
|----|-------------|--------------|
| SV-06 | Sequelize migrations (paypalSubscriptionId, composite indexes) | Needs migration tooling setup |
| FE-03-full | HttpOnly cookie + CSRF | Full-stack coordinated change |
| U-M1 | HeroSection LCP refactor | Needs product sign-off |
| Cleanup | Remove `@types/stripe` devDependency | Low risk but non-trivial test |
| getFavorites | view_count scalar subquery | Still uses `p.views?.length` |
| Blog rich-text editor | Inline image embedding in post body | Needs Tiptap or Quill integration |
| HeroSection ambassador link | `<Link passHref><motion.button>` — HTML validity concern | Low impact; no runtime error |
| Mobile CSS | Comprehensive responsive audit of all pages | Not started |

---

## Cumulative Project Health (after 4 iterations)

| Metric | Before Iter 1 | After Iter 4 |
|--------|--------------|--------------|
| Subscription activation | ❌ Never worked | ✅ Works (Stripe + PayPal) |
| Partnership approval | ❌ Manual DB insert needed | ✅ Auto-creates TrustedPartner |
| Admin stale data | ❌ Requires page refresh | ✅ Cache cleared on every write |
| Blog embedded images | ❌ Never displayed | ✅ Gallery below content |
| 3D component GPU | ❌ WebGL + MeshDistortMaterial lag | ✅ Pure CSS, 0 GPU shaders |
| Course detail page | ❌ Missing | ✅ `/courses/[slug]` |
| Resource detail page | ❌ Missing | ✅ `/resources/[id]` |
| Course admin creation | ❌ No UI | ✅ Admin form with file upload |
| PWA installable | ⚠️ Manifest existed, no prompt | ✅ Install banner on mobile |
| Auth cache role lag | ❌ 30s delay on admin role change | ✅ Instant (clearUserCache) |
| Redis cache invalidation | ❌ Partners/Leadership never cleared | ✅ Cleared on every write |
