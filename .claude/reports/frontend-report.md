# Frontend Expert — Iteration 4 Investigation Report
Agent: frontend-expert · Iteration 4 · 2026-04-25

---

## FE-01 — Admin stale data: browser cache bypasses fetchData(true)

**Root cause:** Admin fetches `/partners`, `/leadership`, `/plans` with `requiresAuth: false`.
Server responds with `Cache-Control: public, max-age=300` (5 min). After a mutation, `fetchData(true)` re-requests the same URLs, but the browser returns a cached response — it never hits the server.

**Fix:** Pass `cache: 'no-store'` in those three fetch calls via the FetchOptions (which extends `RequestInit` — this field is supported). This forces the browser to always revalidate. Admin-only routes already send the auth token so they bypass Redis cache automatically.

---

## FE-02 — Partnership approval: no tier selection, no auto-partner visible in UI

**File:** `client/src/app/admin/page.tsx` (partner-applications tab, lines 662-671)
Current: Approve/Reject buttons only. The `handlePartnerAppStatus(id, 'approved')` sends `{ status: 'approved' }` with no tier.

**Fix:**
- Add `approvalDialog` state: `{ open: boolean, app: PartnerApplication | null, tier: string }`
- Replace direct Approve button with "Review & Approve" → opens a dialog showing all submitted details + tier select
- On confirm, send `{ status: 'approved', tier }` to backend
- Update `handlePartnerAppStatus` signature to accept optional `tier`

---

## FE-03 — Blog content images never displayed

**File:** `client/src/app/blog/[slug]/BlogPostClient.tsx`
The post's `images: string[]` field (attached uploads) is not in the `BlogPost` interface and not rendered.
**Fix:** Add `images?: string[]` to the `BlogPost` interface. After the content div, render a responsive image gallery for `post.images` when non-empty. Each image resolves via `resolveUploadUrl`.

Also: the blog create page uploads content images but never shows the upload URLs to the author, so authors cannot embed them manually in the content. Fix: after upload show image URLs so they can be copied and pasted as `<img>` tags in content.

---

## FE-04 — BiomimeticTooth3D: GPU lag

**File:** `client/src/components/BiomimeticTooth3D.tsx`
Problems:
- 4 FloatingOrbs each using `Sphere args={[0.8, 64, 64]}` — 64 lat/lon segments = 4096 vertices per orb = 16k vertices just for orbs
- `MeshDistortMaterial` runs a shader distortion pass every frame
- `useFrame` firing on all 5 components every animation frame (~60fps)
- No LOD or frameloop throttling

**Fix:** Replace entire component with a pure CSS + Framer Motion 3D animation. Zero WebGL, zero GPU shader, identical visual feel. The tooth becomes a styled div with CSS perspective/rotateX/rotateY transforms. Floating orbs become motion-animated divs with radial gradients.

---

## FE-05 — Course detail page missing

**File:** Missing: `client/src/app/courses/[slug]/page.tsx`
The courses list shows cards with "Enroll Now" button that has no href. Clicking does nothing.
**Fix:** Create `/courses/[slug]/page.tsx` — SSR course detail page with title, description, featured image, price, access level, launch date, "Enroll / Notify Me" CTA.

---

## FE-06 — Resource detail page missing

**File:** Missing: `client/src/app/resources/page.tsx`, `client/src/app/resources/[id]/page.tsx`
No resource listing or detail view exists on the frontend. Resources exist in the API but have no UI.
**Fix:** Create `/resources/page.tsx` (list) and `/resources/[id]/page.tsx` (detail + download).

---

## FE-07 — Ambassador apply page: router.push during render

**Status:** Already fixed in Iter 3 (useEffect pattern). Current file at line 30-37 has the correct pattern. The error should no longer appear with a hard browser refresh. No code change needed.

The HeroSection button (`<Link href="/ambassador/apply" passHref><motion.button>`) uses a deprecated passHref + button pattern. This is a minor HTML validity concern but NOT the cause of the reported error. Low priority.

---

## FE-08 — PWA install prompt missing

**File:** `client/public/site.webmanifest` — exists and is correct.
Missing: the "Add to Home Screen" prompt component. The `beforeinstallprompt` event needs to be captured and a banner displayed.
**Fix:** Create `client/src/components/PWAInstallBanner.tsx` and add it to the root layout.

---

## FE-09 — Admin: Course creation form missing

The admin page has a Resource creation dialog (content tab) but NO Course creation form.
**Fix:** Add a Course dialog in the admin content tab alongside the resource one.

---

## Fixes Required
| ID | File | Change |
|----|------|--------|
| FE-01 | admin/page.tsx | cache: 'no-store' on 3 public fetches |
| FE-02 | admin/page.tsx | Approval dialog with tier select |
| FE-03 | blog/[slug]/BlogPostClient.tsx | Render images[] gallery |
| FE-04 | BiomimeticTooth3D.tsx | Replace with CSS animation |
| FE-05 | courses/[slug]/page.tsx (NEW) | Course detail page |
| FE-06 | resources/page.tsx + resources/[id]/page.tsx (NEW) | Resource list + detail |
| FE-07 | No change needed | Already fixed |
| FE-08 | PWAInstallBanner.tsx (NEW) + layout.tsx | Install prompt |
| FE-09 | admin/page.tsx | Course creation form |

Status: **analysis complete**
