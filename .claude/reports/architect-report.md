# Architect Report — Iteration 8
Agent: architect · Iteration 8 · 2026-04-26

## Verdict: APPROVED WITH CONDITIONS

---

## Cross-cutting review

### P0 Bug: allResources.map crash (FE-BUG-01 / BE-RESOURCE-TYPE)

Both agents correctly identified the root cause: `GET /resources` returns
`{ data: [], meta: {} }` but admin/page.tsx types it as `Resource[]`.

**Contract decision:** The paginated envelope is the correct server shape — do NOT
change the backend. The admin page must handle the paginated format.

**Approved fix (frontend only):**
- Change fetch: `api.get<{ data: Resource[], meta: unknown }>('/resources?limit=500', ...)`
- Change extraction: `.data ?? []`
- The `?limit=500` is safe: admin needs all resources; 500 is a reasonable cap.

APPROVED — no backend change required.

---

### FE-THREE-JS — Remove three.js packages

No import of `three`, `@react-three/fiber`, or `@react-three/drei` exists in source files.
Removing them is safe. This is a clean-up fix with zero functional risk.

**Condition:** After uninstall, run `npx tsc --noEmit` in client to confirm zero errors
(no hidden type dependency on these packages).

APPROVED WITH CONDITION.

---

### FE-EDIT-01 + FE-EDIT-02 — Course and Resource edit pages

Backend `PUT /courses/:id` and `PUT /resources/:id` both exist, support file upload, and return the updated resource. The edit pages are purely additive.

**Contract for course edit page:**
- Fetch course data via `GET /courses` (returns array) → find by id
- Submit via `PUT /courses/:id` with FormData (same fields as new page)
- `requiredRole: 'admin'` on the PUT call
- If new image uploaded → server overwrites `featured_image`. Show current image thumbnail.
- Slug should be editable (unique constraint enforced server-side)

**Contract for resource edit page:**
- Fetch resource data — resource routes require auth, so fetch `GET /resources?limit=500`
  and find by id, OR pass the course object as a URL search param (use fetch approach)
- Submit via `PUT /resources/:id` (JSON body — no file upload middleware on PUT in resource.routes.ts)

**IMPORTANT condition (FE-EDIT-02):** Check `resource.routes.ts` — the `PUT /:id` route does NOT have
`upload.single('file')` middleware. The resource edit page should use a JSON body, NOT FormData.
If file replacement is needed, that is a separate backend change (out of scope this iteration).
For this iteration: edit metadata only (title, description, category, tags, access_level, file_url, file_name, file_type).

APPROVED WITH CONDITION.

---

### FE-ADMIN-EDIT-BTNS — Add Edit buttons to admin content cards

Simple additive UI change. No contract implications.

**Condition:** The edit link must include the `id`, not the `slug` (course has both but
the edit route uses `:id` for `PUT /courses/:id`). Use `course.id` not `course.slug`.

APPROVED WITH CONDITION.

---

### FE-AUTH-01 — Add requiredRole: 'admin' to 19 call sites

Defence-in-depth fix. Since the admin page already guards rendering behind
`user.role === 'admin'`, this is not a critical security hole but is good practice.

**Condition:** The `api.patch('/contact/:id/status', ...)` and
`api.patch('/admin/applications/:id/status', ...)` calls are ALREADY protected by
server-side middleware (`isAdmin`). Adding client-side `requiredRole` is additive only.
Do NOT add `skipErrorHandling: true` to these calls — they should still surface errors.

APPROVED WITH CONDITION.

---

### FE-FORM-DUP-01 — Duplicate name="logo" and name="image" inputs

**Contract decision:** The simplest safe fix is to rename the text URL inputs to
`logo_url` (partner) and `image_url` (leadership), then update the handlers:

```typescript
// handlePartnerSubmit — before api.put/post:
const logoFile = formData.get('logo'); // file input keeps name="logo"
const logoUrl = formData.get('logo_url') as string;
if (!logoFile && logoUrl) formData.set('logo', logoUrl); // promote text URL to logo
formData.delete('logo_url');
```

This ensures FormData always has at most ONE `logo` entry: either the uploaded file
OR the text URL, but never both.

**Condition:** Apply the same pattern to leadership dialog (image_url → image).

APPROVED WITH CONDITION.

---

### FE-CONTRAST — Navigation text-white/90 → text-white

Simple CSS opacity fix. `text-white` (rgba 255,255,255,1.0) on `bg-primary`
provides the correct contrast ratio. The `/90` opacity suffix was cosmetic but
unintentionally fails WCAG 4.5:1 for normal text.

APPROVED.

---

### FE-LCP — Hero animation delay causes late LCP

Changing `delay: 0.1 → 0` on the motion.h1 is safe and reduces paint time.

**Condition:** Do NOT attempt to convert `heroBg` to a Next.js `<Image>` background
in this iteration — that requires significant layout refactoring and is out of scope.
Limit the fix to: (1) remove h1 animation delay, (2) add `fetchpriority="high"` hint
via `<link rel="preload">` in the Next.js `<head>` if easily done with `next/head`.

APPROVED WITH CONDITION.

---

### BE-PERF-01 — getFavorites scalar subquery

Same pattern as the main blog list (P-B1, Iter 2). The alias for the subquery
must match the alias used in the `.get()` call in the map function. Use
`"blogPost"."id"` (camelCase) because Sequelize maps `blogPost` as the
association alias.

**IMPORTANT condition:** Verify the SQL alias in the subquery matches the actual
table name. The BlogPost model uses `tableName: 'blog_posts'` (underscored).
The correct subquery is:
```sql
(SELECT COUNT(*)::int FROM "blog_views" AS "bv" WHERE "bv"."blog_post_id" = "blogPost"."id")
```
Note: `"blogPost"` is the Sequelize alias, NOT the table name.

APPROVED WITH CONDITION.

---

### SV-06 — paypalSubscriptionId on Subscription model

Safe additive column. `alter: true` sync will add it without data loss.

APPROVED.

---

## Approval Matrix

| Fix ID | Owner | Status | Condition |
|--------|-------|--------|-----------|
| FE-BUG-01 (allResources.map) | frontend-expert | ✅ APPROVED | Use ?limit=500 + extract .data |
| FE-THREE-JS (uninstall) | frontend-expert | ✅ APPROVED | Run tsc after uninstall |
| FE-EDIT-01 (course edit page) | frontend-expert | ✅ APPROVED | Use course.id; show current image thumbnail |
| FE-EDIT-01b (edit btn in card) | frontend-expert | ✅ APPROVED | Link uses course.id |
| FE-EDIT-02 (resource edit page) | frontend-expert | ✅ APPROVED | JSON body only (no file upload); metadata edit |
| FE-EDIT-02b (edit btn in card) | frontend-expert | ✅ APPROVED | Link uses res.id |
| FE-AUTH-01 (requiredRole) | frontend-expert | ✅ APPROVED | Don't add skipErrorHandling |
| FE-CONTRAST (nav text) | frontend-expert | ✅ APPROVED | None |
| FE-FORM-DUP-01 (duplicate names) | frontend-expert | ✅ APPROVED | logo_url pattern; same for image_url |
| FE-LCP (animation delay) | frontend-expert | ✅ APPROVED | h1 delay only; no Image refactor |
| BE-PERF-01 (getFavorites subquery) | backend-expert | ✅ APPROVED | Verify "blogPost" alias in SQL |
| SV-06 (paypalSubscriptionId) | backend-expert | ✅ APPROVED | None |
| FE-BLOG-RT (Tiptap) | — | ⏸️ DEFERRED | Significant feature; next iteration |
| BE-COOKIE (HttpOnly) | — | ⏸️ DEFERRED | Security refactor; dedicated iteration |

Status: **APPROVED WITH CONDITIONS**
