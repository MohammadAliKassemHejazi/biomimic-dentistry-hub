# Frontend Expert Report — Iteration 13

**Agent:** frontend-expert  
**Date:** 2026-04-28  
**Status:** ANALYSIS COMPLETE

---

## Critical Issue Found

### FE-13-01 — Event handler in Server Component on /offline page
**Severity:** CRITICAL — Build-blocking  
**File:** `client/src/app/offline/page.tsx` — line 63  

**Root Cause:**  
`OfflinePage` is a **Server Component** (no `"use client"` directive). It exports
`metadata`, which correctly requires server context. However, it contains a
`<button>` with `onClick={() => window.location.reload()}` — event handlers
cannot be serialized and sent to the browser from a Server Component. Next.js
throws during static generation:

```
Error: Event handlers cannot be passed to Client Component props.
  {onClick: function onClick, className: ..., children: ...}
```

**Why we cannot simply add `"use client"` to the page:**  
The file exports `metadata` — Next.js only allows `metadata` exports from Server
Components. Adding `"use client"` would break the metadata export.

**Required fix:**  
Extract the retry `<button>` (the only interactive element) into a separate
`"use client"` component: `RetryButton.tsx` in the same directory.
Import it into `page.tsx`. The page stays a Server Component; the button
becomes a Client Component island.

---

## Full Scan Results

- All other `app/` pages with event handlers already have `"use client"` ✅
- `error.tsx` — has `"use client"`, correctly handles `onClick` and `useEffect` ✅
- No other Server Components with event handlers or browser-only APIs found

---

## Fix Plan

| ID | File | Change | Risk |
|---|---|---|---|
| FE-13-01a | `client/src/app/offline/RetryButton.tsx` | Create new `"use client"` component with retry button | None (new file) |
| FE-13-01b | `client/src/app/offline/page.tsx` | Replace inline button with `<RetryButton />` import | Low |
