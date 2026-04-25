# Frontend Expert — Iteration 8 Investigation Report
Agent: frontend-expert · Iteration 8 · 2026-04-26

---

## 🚨 P0 — FE-BUG-01: `allResources.map is not a function` crashes admin Content tab

**File:** `client/src/app/admin/page.tsx` (lines 215, 230)

**Root cause:** `GET /resources` returns a **paginated envelope**
`{ data: Resource[], meta: { total, page, limit, totalPages } }`,
but the admin page is typed as `api.get<Resource[]>(...)` and then calls
`setAllResources(take(resourcesRes, 'All resources', [], onPanelError))`.
`take()` returns the entire object (`{ data, meta }`), not the array.
`allResources` is therefore set to the plain object → `.map` throws.

**Fix (admin/page.tsx):**
```typescript
// Line 215 — change type annotation:
api.get<{ data: Resource[], meta: unknown }>('/resources?limit=500', { skipErrorHandling: true }),

// Line 230 — extract .data:
setAllResources(
  (take(resourcesRes, 'All resources', { data: [], meta: {} }, onPanelError) as { data: Resource[] }).data ?? []
);
```

Passing `?limit=500` ensures all resources are fetched in one call for the admin view.

---

## FE-EDIT-01 — Admin courses list has no Edit button; `/admin/courses/[id]/edit` page missing

**File:** `client/src/app/admin/page.tsx` lines 1160–1175 (Courses card)

**Observed:** Each course row shows only a red Delete button.
**Required:** An Edit button/link that routes to `/admin/courses/[id]/edit`.
The backend `PUT /courses/:id` already exists with full file-upload support.

**Fix (two parts):**
1. Add `<Button asChild size="sm" variant="outline"><Link href={/admin/courses/${course.id}/edit}><Edit /></Link></Button>` alongside the Delete button in the courses card.
2. Create `client/src/app/admin/courses/[id]/edit/page.tsx` — pre-populated form, all same fields as the "new" page but initialized from `GET /courses/:slug` (or fetched by id via slug list), submits `PUT /courses/:id`, redirects back to `/admin`.

**Field mapping:** Same as `/admin/courses/new/page.tsx` (title, slug, description, price, access_level, coming_soon, launch_date, featured_image, stripe_price_id). For the edit page, pre-populate from the existing course object and show the current image as a thumbnail.

---

## FE-EDIT-02 — Admin resources list has no Edit button; `/admin/resources/[id]/edit` page missing

**File:** `client/src/app/admin/page.tsx` lines 1196–1208 (Resources card)

**Observed:** Each resource row shows only a red Delete button.
**Required:** An Edit button/link that routes to `/admin/resources/[id]/edit`.
The backend `PUT /resources/:id` already exists.

**Fix (two parts):**
1. Add `<Button asChild size="sm" variant="outline"><Link href={/admin/resources/${res.id}/edit}><Edit /></Link></Button>` in the resources card.
2. Create `client/src/app/admin/resources/[id]/edit/page.tsx` — pre-populated form (title, description, category, file_type, tags, file_url, file_name, access_level), submits `PUT /resources/:id`, redirects back to `/admin`. Show current file info.

---

## FE-AUTH-01 — 17 admin API calls in admin/page.tsx missing `requiredRole: 'admin'`

**File:** `client/src/app/admin/page.tsx`

The client-side role guard added in Iter 7 is only applied to the NEW course and resource creation pages. All existing admin/page.tsx handlers skip the `requiredRole` option, meaning a rogue script or component could call them even if the user's role drops.

**Affected call sites (line → fix):**

| Line | Handler | Call | Fix |
|------|---------|------|-----|
| 255 | handleApproveApp | `api.patch('/admin/applications/:id/status', ...)` | add `{ requiredRole: 'admin' }` |
| 265 | handleRejectApp | `api.patch('/admin/applications/:id/status', ...)` | add `{ requiredRole: 'admin' }` |
| 279/281 | handleApproveContent | `api.patch` / `api.put` | add `{ requiredRole: 'admin' }` |
| 293 | handleRoleChange | `api.patch('/admin/users/:id/role', ...)` | add `{ requiredRole: 'admin' }` |
| 303 | handleDeleteSubscriber | `api.delete('/newsletter/:id')` | add `{ requiredRole: 'admin' }` |
| 316 | handleDeleteCourse | `api.delete('/courses/:id')` | add `{ requiredRole: 'admin' }` |
| 327 | handleDeleteResource | `api.delete('/resources/:id')` | add `{ requiredRole: 'admin' }` |
| 341 | handlePartnerSubmit (put) | `api.put('/partners/:id', formData)` | add `{ requiredRole: 'admin' }` |
| 344 | handlePartnerSubmit (post) | `api.post('/partners', formData)` | add `{ requiredRole: 'admin' }` |
| 358 | handleDeletePartner | `api.delete('/partners/:id')` | add `{ requiredRole: 'admin' }` |
| 372 | handleMemberSubmit (put) | `api.put('/leadership/:id', formData)` | add `{ requiredRole: 'admin' }` |
| 375 | handleMemberSubmit (post) | `api.post('/leadership', formData)` | add `{ requiredRole: 'admin' }` |
| 389 | handleDeleteMember | `api.delete('/leadership/:id')` | add `{ requiredRole: 'admin' }` |
| 399 | handleMessageStatus | `api.patch('/contact/:id/status', ...)` | add `{ requiredRole: 'admin' }` |
| 410 | handlePartnerAppStatus | `api.patch('/admin/partner-applications/:id/status', ...)` | add `{ requiredRole: 'admin' }` |
| 434 | handleTemplateUpload | `api.post('/admin/settings/partner-templates/:tier', ...)` | add `{ requiredRole: 'admin' }` |
| 456 | handlePlanSubmit | `api.put('/plans/:id', data)` | add `{ requiredRole: 'admin' }` |
| 811 | (inline) | `api.post('/admin/settings/partnership-kit', formData)` | add `{ requiredRole: 'admin' }` |
| 1012 | (inline) | `api.post('/plans/seed', {})` | add `{ requiredRole: 'admin' }` |

**Note:** Since the admin dashboard only renders if `user.role === 'admin'` (checked before render), this is a defence-in-depth fix, not a critical security hole. It prevents rogue usage if the guard were bypassed.

---

## FE-FORM-DUP-01 — Partners dialog: duplicate `name="logo"` inputs

**File:** `client/src/app/admin/page.tsx` lines 854–858

**Problem:** The partner Add/Edit dialog has:
```jsx
<Input name="logo" defaultValue={editingItem?.logo} placeholder="https://... or 🦷" />
<Input name="logo" type="file" />
```
Two inputs share `name="logo"`. When a user fills the URL text box AND selects a file, FormData sends both, causing ambiguous behavior (whichever the server processes second wins).

**Same issue at lines 936 & 940 for Leadership dialog** (`name="image"` used twice).

**Fix:** Rename the text inputs to `logo_url` / `image_url` and update the backend handler to read `req.body.logo_url || req.body.logo` (falling back gracefully).

---

## FE-THREE-JS — Three.js still bundled (285 KB wasted), Lighthouse unused-JS score: 0

**Files:** `client/package.json`

Even though no source file imports Three.js after Iter 4/5, the packages are still listed as dependencies:
```json
"@react-three/drei": "^10.7.7",
"@react-three/fiber": "^9.5.0",
"three": "^0.182.0"
```
Turbopack/Next.js bundles these and they appear in Lighthouse as wasted JS:
- `node_modules_three_build_three_core_*.js` — 150 KB wasted
- `node_modules_@react-three_fiber_dist_*.js` — 98 KB wasted
- `node_modules_three_build_three_module_*.js` — 38 KB wasted
- **Total: ~286 KB of unused JavaScript shipped to every visitor**

**Fix:** Uninstall the packages from client:
```bash
cd client && npm uninstall three @react-three/fiber @react-three/drei
```
This will remove them from `package.json`, `package-lock.json`, and `node_modules`.

---

## FE-CONTRAST — Navigation text fails WCAG color contrast (Accessibility: 93/100)

**File:** `client/src/components/Navigation.tsx`

**Lighthouse finding:** Multiple elements with `text-white/90` class fail color contrast:
- `div.flex > div.flex > div.hidden > a.text-white/90` (nav links)
- Multiple `button` elements with `hover:text-white hover:bg-white/10`

`text-white/90` = `rgba(255,255,255,0.9)` — the 10% transparency lowers the effective contrast ratio below the WCAG 4.5:1 threshold for normal text.

**Fix (Navigation.tsx):**
Replace `text-white/90` with `text-white` in the desktop nav link classes and dropdown trigger classes. The navigation background (`bg-primary`) provides sufficient contrast against `text-white` (100% opacity).

```typescript
// linkClass — change text-white/90 to text-white:
`text-white hover:text-white transition-colors...`

// DropdownNav trigger class — same:
`text-white hover:text-white hover:bg-white/10...`

// User menu trigger:
`text-white hover:text-white hover:bg-white/10`
```

---

## FE-LCP — LCP at 2.5 s (score 0.47), target < 1.2 s

**File:** `client/src/components/HeroSection.tsx`

**Root cause:** The hero background image is loaded as a CSS background-image via `style={{ backgroundImage: url(...) }}`. Browser cannot preload CSS background images at parse time; they're discovered only after the CSS is evaluated. The hero `glass-card` with text is likely the LCP element.

**Contributing factors:**
1. `heroBg` imported as a static asset and referenced via `.src` in an inline style — no `<link rel="preload">` hint
2. The hero section has `initial={{ scale: 1.1, opacity: 0 }}` Framer Motion animation — starts with opacity 0, so the LCP text is invisible for the animation duration

**Fixes:**
1. In `next.config.ts`, add `<link rel="preload" as="image">` for the hero background via `experimental.optimizeServerReact` OR use Next.js `<Image>` as an absolutely positioned background instead of CSS `backgroundImage`.
2. Change the motion.h1 animation `delay: 0.1` to `delay: 0` — reduce initial paint delay for LCP text.
3. Add `priority` attribute if the hero image is converted to `<Image>`.

---

## FE-BLOG-RT — Blog create page uses plain textarea (no rich-text editor)

**File:** `client/src/app/blog/create/page.tsx`

The content field is a plain `<Textarea>` — no formatting options for headings, bold, links, or inline images. Authors cannot embed uploaded images into their content.

**Deferred:** Tiptap integration is a significant new feature. Recommended for a dedicated iteration.
- Would require: `npm install @tiptap/react @tiptap/starter-kit @tiptap/extension-image @tiptap/extension-link`
- New `TiptapEditor.tsx` component
- Image upload + URL injection into editor content

---

## Summary of Fixes Required

| ID | Priority | File | Change |
|----|----------|------|--------|
| FE-BUG-01 | **P0** | admin/page.tsx | Fix allResources paginated response extraction |
| FE-THREE-JS | HIGH | client/package.json | `npm uninstall three @react-three/fiber @react-three/drei` |
| FE-EDIT-01 | HIGH | admin/courses/[id]/edit/page.tsx (NEW) | Course edit page |
| FE-EDIT-01b | HIGH | admin/page.tsx | Add Edit button to courses card |
| FE-EDIT-02 | HIGH | admin/resources/[id]/edit/page.tsx (NEW) | Resource edit page |
| FE-EDIT-02b | HIGH | admin/page.tsx | Add Edit button to resources card |
| FE-AUTH-01 | MEDIUM | admin/page.tsx | Add `requiredRole: 'admin'` to 19 call sites |
| FE-CONTRAST | MEDIUM | Navigation.tsx | `text-white/90` → `text-white` |
| FE-FORM-DUP-01 | MEDIUM | admin/page.tsx | Fix duplicate name="logo" and name="image" inputs |
| FE-LCP | MEDIUM | HeroSection.tsx | Reduce animation delay on h1; preload hero bg |
| FE-BLOG-RT | LOW | blog/create/page.tsx | Tiptap rich-text (deferred) |

Status: **analysis complete**
