# Frontend Expert Report — Iteration 10

**Agent:** frontend-expert  
**Date:** 2026-04-27  
**Scope:** PWA, SEO, performance, mobile experience, Google ranking

---

## Audit Findings

### FE-PWA-01 — CRITICAL: Service worker is a no-op (zero caching)
`client/public/sw.js` is 5 lines that only call `skipWaiting()` and `claim()`.
No assets are cached. On mobile networks this means:
- Every page load requires full network round-trips
- Zero offline support
- Chrome's "Add to Home Screen" installability criteria met only partially
- Android does NOT prompt for install reliably without a meaningful SW

**Fix:** Full production SW with cache-first for static assets, network-first for HTML, network-only for API, offline fallback page.

### FE-PWA-02 — HIGH: Manifest icon `purpose` is wrong
```json
{ "src": "/logo.png", "sizes": "192x192", "purpose": "any maskable" }
```
The W3C spec requires `any` and `maskable` to be **separate** icon entries. Combining them as `"any maskable"` works in some browsers but is deprecated. Chrome on Android will warn in DevTools. Maskable icons need an inner safe-zone; if `logo.png` isn't designed for it, Android's adaptive icons will crop it badly.

**Fix:** Two separate icon entries per size: one with `"purpose": "any"`, one with `"purpose": "maskable"`. Add missing sizes (96x96, 384x384).

### FE-PWA-03 — HIGH: No SW registration code
No code in any component or layout explicitly calls `navigator.serviceWorker.register('/sw.js')`. The manifest links to `/sw.js` but browsers only auto-register from `<link rel="manifest">` — the SW must be registered with JS.

**Fix:** Register SW inside `Providers.tsx` via `useEffect`.

### FE-SEO-01 — MEDIUM: Ambassador page has no metadata layout
`/ambassador` route has no `layout.tsx` — Google sees only the default root metadata for this important conversion page.

**Fix:** Create `client/src/app/ambassador/layout.tsx` with title, description, OG, keywords.

### FE-SEO-02 — MEDIUM: JSON-LD uses `strategy="afterInteractive"`
`<Script strategy="afterInteractive">` injects JSON-LD AFTER the browser is interactive — meaning the structured data appears AFTER the initial HTML payload. While Googlebot CAN execute JS, the recommended practice for schema.org data is inline in the HTML for fastest crawl discovery.

**Fix:** Replace `<Script strategy="afterInteractive">` with a plain inline `<script type="application/ld+json">` tag — renders synchronously in initial HTML.

### FE-MOBILE-01 — HIGH: Missing Apple mobile meta tags
`layout.tsx` has no:
- `apple-mobile-web-app-capable: yes` — enables standalone mode on iOS
- `apple-mobile-web-app-status-bar-style` — controls iOS status bar appearance
- `apple-mobile-web-app-title` — app name shown under the iOS home screen icon
- `mobile-web-app-capable: yes` — fallback for other mobile browsers
- `format-detection: telephone=no` — prevents iOS from auto-linking numbers as calls

**Fix:** Add these to `metadata.other` in `layout.tsx`.

### FE-MOBILE-02 — MEDIUM: No offline fallback page
When the user is offline and requests a page not in the SW cache, the browser shows a raw Chrome/Safari network error screen. An offline page with the app's branding is required for PWA compliance.

**Fix:** Create `client/src/app/offline/page.tsx` and precache it in the SW.

### FE-PERF-01 — MEDIUM: No security / performance headers in next.config.ts
Missing HTTP headers that affect both security and SEO ranking signals:
- `X-Frame-Options`: prevents clickjacking (security + trust signal)
- `X-Content-Type-Options`: nosniff
- `Strict-Transport-Security`: required for HTTPS score
- `Referrer-Policy`: data minimisation
- `Permissions-Policy`: privacy signals

**Fix:** Add security headers to `next.config.ts` `headers()` function.

---

## Fix Summary

| ID | Severity | Fix |
|---|---|---|
| FE-PWA-01 | CRITICAL | Full caching service worker |
| FE-PWA-02 | HIGH | Separate `any` + `maskable` icon entries in manifest |
| FE-PWA-03 | HIGH | SW registration in Providers.tsx |
| FE-SEO-01 | MEDIUM | ambassador/layout.tsx with metadata |
| FE-SEO-02 | MEDIUM | Inline JSON-LD (remove afterInteractive Script) |
| FE-MOBILE-01 | HIGH | Apple mobile meta tags in layout.tsx |
| FE-MOBILE-02 | MEDIUM | Offline fallback page |
| FE-PERF-01 | MEDIUM | Security headers in next.config.ts |

**Analysis complete.**
