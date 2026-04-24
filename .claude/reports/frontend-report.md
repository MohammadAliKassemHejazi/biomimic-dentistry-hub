# Frontend Expert — Iteration 2 Report
Agent: frontend-expert · Iteration 2 · 2026-04-24
Scope: /client (Next.js 16 / React 19 / TS strict)
Focus: performance, SEO, UX/UI (user + admin)

## Summary
Found **23 issues** across three lenses. Biggest wins are (a) missing per-page `generateMetadata` on high-traffic blog pages, (b) `remotePatterns: '**'` killing `next/image` optimization safety, (c) 11-way `Promise.all` in admin that fails the entire dashboard if any single panel 500s, (d) no `sitemap.ts`/`robots.ts`, and (e) localhost fallbacks still leaking into the prod bundle.

Carryover issues from Iter 1 that were never applied are folded into this batch so they finally ship.

---

## 🔴 CRITICAL — Performance / SEO

### P-C1 · `next.config.ts` ships wildcard remotePatterns
**File:** `client/next.config.ts:29-35`
Any `https://**` host is allowed through the image optimizer. Mitigates to: (a) SSRF-lite risk, (b) unoptimized third-party images padding LCP. Allow-list: `localhost`, explicit CDN host (from env), plus the app's own origin for `/uploads/*` rewrites.

### S-C1 · No metadata base / no OpenGraph / no Twitter card
**File:** `client/src/app/layout.tsx:13-16`
`metadata` has only `title` + `description`. No `metadataBase`, no `openGraph`, no `twitter`, no canonical, no `icons`, no `robots`. Every share on LinkedIn/WhatsApp/X/Facebook renders a blank preview.

### S-C2 · No `sitemap.ts`, no `robots.ts`
**Files:** missing. `public/robots.txt` exists but does not reference a sitemap. Google's crawler therefore has no discovery path for `/blog/*`, `/courses`, `/resources`.

### S-C3 · Blog detail page has no `generateMetadata`
**File:** `client/src/app/blog/[slug]/page.tsx`
This is a `'use client'` component that fetches on mount. It cannot emit per-post metadata. Shared links show the root-layout title for every post. Needs a server component layer that runs `generateMetadata` and delegates to the client body.

---

## 🟠 HIGH — UX/UI

### U-H1 · Admin dashboard: 11-way `Promise.all` → whole page blocks on any single failing panel
**File:** `client/src/app/admin/page.tsx:166-178` (carryover FE-05)
If any one of `api.get('/admin/users'|/applications|/content/pending|...')` 500s, `loading` never flips to `false`, and the admin sees an endless spinner. On slow networks this is also the total time-to-content.

**Fix:** `Promise.allSettled`, set each panel independently, surface a single `toast` per failed panel.

### U-H2 · Admin toast `{ title: "Failed" }` gives no reason
**File:** `client/src/app/admin/page.tsx` — 14 call sites
Admin sees "Failed" with no description when e.g. role change fails. `api.ts` already attaches `error.message`; admin handlers swallow it.

**Fix:** always pass `description: error.message`. Use a small `describeError(error)` helper.

### U-H3 · Navigation: no skip link, dropdown trigger has no `aria-label`
**File:** `client/src/components/Navigation.tsx`
Screen-reader users have no way to skip past the nav to `<main>`. The hamburger button has an icon only with no `aria-label="Toggle menu"`.

### U-H4 · not-found page: straight apostrophe in raw JSX
**File:** `client/src/app/not-found.tsx:21` — `We couldn't find the page...`
`react/no-unescaped-entities` rule fails under strict ESLint. Low-impact but a11y/correctness.

### U-H5 · Dashboard `/dashboard`: no skeleton, just a spinning ring
**File:** `client/src/app/dashboard/page.tsx:149-155`
Jumps from full-page spinner to fully populated grid. Content-layout shift is jarring. Use `Skeleton` blocks per card.

### U-H6 · Login / subscription error toasts have no `description`
**File:** `client/src/app/login/page.tsx:26-29`, `client/src/app/subscription/page.tsx:186` (carryover FE-14/15)
Still says only `title: "Failed"`.

---

## 🟠 HIGH — Performance (client)

### P-H1 · localhost fallbacks still in prod bundles (carryover FE-02)
- `client/src/lib/api.ts:4` → `|| 'http://localhost:5000/api'`
- `client/src/components/SponsorsSection.tsx:49`
- `client/src/components/VIPSection.tsx:43`
- `client/src/app/admin/page.tsx:144`
- `client/src/app/blog/[slug]/page.tsx:41`

**Fix:** single `client/src/lib/env.ts` with a throwing getter; import everywhere else.

### P-H2 · No `experimental.optimizePackageImports`
**File:** `client/next.config.ts`
`lucide-react`, `framer-motion`, `date-fns`, `recharts` are imported as namespaces in many files. Next 16 can tree-shake these per-icon/util when listed, saving ~50-150KB of JS.

### P-H3 · `images.unoptimized: process.env.NODE_ENV === 'development'`
**File:** `client/next.config.ts:20`
This only helps dev. Production should also set `deviceSizes` / `imageSizes` + require explicit sizes on all `<Image>`. Two hero components pass only `width`/`height` which is fine, but the blog detail uses `fill` without `sizes` audit in a few places.

### P-H4 · Footer submits via raw `fetch`, bypassing the api helper (carryover FE-12)
**File:** `client/src/components/Footer.tsx:16`
Inconsistent error surfacing + doesn't use the unified toast path. Trivial refactor.

### P-H5 · No production viewport export on layout
**File:** `client/src/app/layout.tsx`
Next 16 prefers `export const viewport: Viewport = {...}` for theme-color / color-scheme.

---

## 🟡 MEDIUM

### U-M1 · Hero section animates 5+ framer-motion wrappers on every mount
**File:** `client/src/components/HeroSection.tsx`
This is the LCP section. The `motion.div` wrappers with `initial={{ opacity: 0, y: 50 }}` delay the meaningful paint by 0.8s minimum. Keep the hero static on first paint, animate only secondary elements. (Optional: leave alone if brand says the animation is core.)

### U-M2 · Admin tabs: all content mounts at once
**File:** `client/src/app/admin/page.tsx:411-1163`
Every `TabsContent` is in the DOM even when inactive. React re-renders all on any data change. Use `mountOnEnter` pattern or conditional rendering by `activeTab`.

### U-M3 · `favicon.ico` is in `public/` but no `<link rel="apple-touch-icon">` or manifest
**File:** `client/public/`
Missing `site.webmanifest`, `apple-touch-icon.png`. PWA installability suffers. iOS share sheets show fallback glyph.

### U-M4 · Nav logo uses `priority` but so does the hero BG? Conflicts for LCP budget.
**Files:** `Navigation.tsx:103` + `HeroSection.tsx:24` (backgroundImage).
LCP element is the hero headline. Nav logo `priority` is fine but hero BG set via inline style is NOT preloaded — on slow 3G the hero paints text-first and image-later (actually OK for LCP, but flags this as an audit point).

### S-M1 · Page-level metadata missing on `/about`, `/contact`, `/courses`, `/resources`
Home has keywords; nothing else does.

### S-M2 · No JSON-LD structured data anywhere
Organization schema on layout, BlogPosting on blog detail, Course on `/courses/[id]` will materially improve Google rich-result surfacing.

### S-M3 · No canonical URL resolution
Relative links + no `alternates.canonical` → Google may index duplicates (`/blog/slug` vs `/blog/slug/`).

---

## 🟢 LOW

- **U-L1** `Footer.tsx` social links all `href="#"` — dead placeholders hurt trust. Left to content team but flagged.
- **U-L2** `Footer.tsx` Education/Community/Organization/Support sections use hash anchors `#courses` etc. that don't exist. Route to real pages.
- **U-L3** Duplicate mobile nav logo + desktop logo — minor bundle waste.
- **U-L4** `globals.css` defines `--transition-smooth` and `--transition-bouncy` that are referenced in `.card-hover` but never defined in `:root`. Silent failure.

---

## Proposed fix set (Iteration 2, frontend)
Apply this iteration:
- **P-C1, P-H1, P-H2, P-H3, P-H4, P-H5**
- **S-C1, S-C2, S-C3, S-M1, S-M2, S-M3**
- **U-H1, U-H2, U-H3, U-H4, U-H5, U-H6**
- **U-M1 (partial — defer hero), U-M3 (manifest + apple icon link tag)**
- **U-L4 (define missing CSS vars)**

Defer:
- **U-M1** full hero static-first refactor — needs product sign-off
- **U-M2** per-tab mount — not blocking
- **U-L1, U-L2** content-team decisions

**Frontend iter-2 analysis complete.** → team-lead
