# Architect Report — Iteration 10

**Agent:** architect  
**Date:** 2026-04-27  
**Status:** ✅ APPROVED WITH CONDITIONS

---

## Cross-Cutting Review

No API contract changes. No conflicts between frontend and backend reports.

---

## Fix Approvals

### ✅ FE-PWA-01 — Full caching service worker

APPROVED WITH CONDITIONS:

1. **Do NOT cache authenticated routes** (`/dashboard`, `/admin`, `/api/*`). A cached 401 page would permanently break the auth flow.
2. **Do NOT cache the SW itself** — browsers handle SW versioning natively.
3. **Use a version constant** at the top of sw.js so bumping it triggers a cache refresh on all clients.
4. **Network-first for HTML** — critical for SSR/ISR freshness. Cache-first only for content-hashed static chunks.
5. **Cache-first for `/_next/static/`** — these are already content-hashed by Next.js, safe to cache indefinitely.
6. **Offline page** must be precached at install time (not on first visit) so it's available when offline.

### ✅ FE-PWA-02 — Manifest icon separation

APPROVED. The `"any maskable"` combined purpose is deprecated per W3C Manifest spec. Separate entries are required for correct adaptive icon behaviour on Android 12+.

### ✅ FE-PWA-03 — SW registration

APPROVED WITH CONDITION: Register SW inside a `useEffect` in `Providers.tsx`. Wrap in `'serviceWorker' in navigator` guard for SSR safety. Only register in production to avoid dev caching issues:
```typescript
if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js');
}
```

### ✅ FE-SEO-01 — Ambassador metadata layout

APPROVED. Simple metadata layout, low risk.

### ✅ FE-SEO-02 — Inline JSON-LD

APPROVED. Replacing `<Script strategy="afterInteractive">` with inline `<script type="application/ld+json" dangerouslySetInnerHTML>` is the canonical pattern for structured data. The `dangerouslySetInnerHTML` is safe here because the JSON is generated server-side from hardcoded constants — no user input is involved.

### ✅ FE-MOBILE-01 — Apple mobile meta tags

APPROVED. These are standard iOS PWA meta requirements. Use `metadata.other` in Next.js App Router layout. Do NOT add `apple-mobile-web-app-status-bar-style: black-translucent` — that overlaps the status bar and breaks layouts. Use `default` instead.

### ✅ FE-MOBILE-02 — Offline page

APPROVED. Keep it lightweight — no auth context, no API calls, just a static branded page.

### ✅ FE-PERF-01 — Security headers

APPROVED WITH CONDITIONS:

1. **No `Content-Security-Policy` this iteration** — CSP requires a complete audit of all script/style/image sources and is out of scope. Adding a wrong CSP breaks the entire site.
2. **Add these headers safely:**
   - `X-Frame-Options: SAMEORIGIN`
   - `X-Content-Type-Options: nosniff`
   - `X-XSS-Protection: 1; mode=block`
   - `Referrer-Policy: strict-origin-when-cross-origin`
   - `Permissions-Policy: camera=(), microphone=(), geolocation=()`
   - `X-DNS-Prefetch-Control: on`
3. **HSTS only in production** — `Strict-Transport-Security` should not be applied in dev (localhost has no TLS).

---

## Architecture Notes

- The SW + manifest together constitute the full PWA install criteria for both Android (Chrome/Edge) and iOS (Safari 16.4+).
- Next.js 14+ automatically handles `<link rel="manifest">` injection when `manifest` is set in metadata. No manual `<link>` tag needed.
- The JSON-LD inline change applies to `layout.tsx` (organization schema) and `page.tsx` (website schema). Blog post JSON-LD (`/blog/[slug]`) is already correctly using inline `<script>` tags — no change needed there.

---

## APPROVED — proceed to PHASE 3 (Apply all 8 fixes)
