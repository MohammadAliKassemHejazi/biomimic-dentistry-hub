# Backend Expert — Iteration 4 Investigation Report
Agent: backend-expert · Iteration 4 · 2026-04-25

## Scope
Partnership auto-approval, admin stale data, blog images, clearUserCache gap, course/resource API readiness.

---

## BE-01 — admin.controller.ts: Three missing behaviours

### BE-01a: updatePartnerApplicationStatus never creates TrustedPartner
**File:** `server/src/controllers/admin.controller.ts:225-238`
```ts
// BROKEN:
await PartnershipRequest.update({ status }, { where: { id } });
res.json({ message: `Application ${status}` });
// Missing: fetch the PartnershipRequest, create TrustedPartner when status='approved'
```
**Fix:** fetch PartnershipRequest by id, when status='approved' upsert a TrustedPartner using name/companyName/message from the request + admin-supplied tier. Import TrustedPartner. Call `clearCache('/api/partners/')` so the partners list is fresh.

### BE-01b: updateUserRole never clears auth cache
**File:** `server/src/controllers/admin.controller.ts:148-169`  
The user cache added in Iter 3 (30s TTL) means a role change in admin takes up to 30s to propagate. Fix: import `clearUserCache` from `auth.middleware` and call it after `User.update`.

### BE-01c: Missing clearCache on approval
After creating TrustedPartner, call `clearCache('/api/partners/')` so the public partners list is invalidated in Redis.

---

## BE-02 — trustedPartner.controller.ts: Zero cache invalidation
**File:** `server/src/controllers/trustedPartner.controller.ts`
- `createPartner`: no `clearCache('/api/partners/')` → new partner visible only after 5 min browser cache expires
- `updatePartner`: same
- `deletePartner`: same

---

## BE-03 — leadershipMember.controller.ts: Zero cache invalidation
**File:** `server/src/controllers/leadershipMember.controller.ts`
- `createMember`, `updateMember`, `deleteMember`: no `clearCache('/api/leadership/')` → same stale data problem as BE-02

---

## BE-04 — blog.controller.ts: images[] never returned
**File:** `server/src/controllers/blog.controller.ts:146-165`
The `BlogPost` model has `images: string[]` (ARRAY of upload URLs). The field is saved on create (line 210: `images: imageUrls`), but the `getPostBySlug` response at line 146-165 never includes `images`. Frontend cannot display attached content images.

**Fix:** Add `images: post.images || []` to the getPostBySlug response JSON.

---

## BE-05 — Course API: image upload not wired for createCourse
**File:** `server/src/controllers/course.controller.ts`, `server/src/routes/course.routes.ts`
The `createCourse` handler reads `req.body.featured_image` as a URL string but the route doesn't use `upload` middleware. No file upload for course featured images via the admin form.

**Fix (low risk):** Add `upload.single('featured_image')` to the POST route, and handle `req.file` in `createCourse` the same way blog posts handle it.

---

## Fixes Required
| ID | File | Change |
|----|------|--------|
| BE-01a | admin.controller.ts | Auto-create TrustedPartner on approve |
| BE-01b | admin.controller.ts | clearUserCache on role change |
| BE-01c | admin.controller.ts | clearCache('/api/partners/') on approve |
| BE-02 | trustedPartner.controller.ts | clearCache on create/update/delete |
| BE-03 | leadershipMember.controller.ts | clearCache on create/update/delete |
| BE-04 | blog.controller.ts | Return images[] in getPostBySlug |
| BE-05 | course.routes.ts + course.controller.ts | Upload middleware for course image |

Status: **analysis complete**
