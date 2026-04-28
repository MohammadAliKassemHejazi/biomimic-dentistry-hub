# Architect Report — Iteration 13

**Agent:** architect  
**Date:** 2026-04-28  
**Status:** APPROVED — No conflicts

---

## Review of frontend-report.md

FE-13-01 is correctly diagnosed. The constraint is clear:

- `metadata` export → Server Component required → cannot add `"use client"` to the page
- `onClick` handler → Client Component required → cannot stay in the server component

### Architectural guidance

1. **Client island pattern** — Extracting only the interactive element into a
   `"use client"` component is the correct App Router pattern for this case.
   The server component renders static HTML; the button hydrates as a client
   island. This is minimal, correct, and follows the principle of pushing
   `"use client"` as deep as possible.

2. **File co-location** — `RetryButton.tsx` belongs in
   `client/src/app/offline/` alongside `page.tsx`. It is a page-scoped
   component, not a shared UI component.

3. **`window.location.reload()` safety** — Inside a `"use client"` component
   this call is safe; it only executes in the browser. No SSR guard needed.

4. **No new shared components** — This is intentionally scoped. Do not add
   `RetryButton` to `/components/ui/` — it has no reuse outside this page.

5. **`metadata` is untouched** — The server component shell must not change
   its `metadata` export in any way.

---

## Decision

| Fix | Decision | Condition |
|---|---|---|
| FE-13-01a | ✅ APPROVED | New file: `client/src/app/offline/RetryButton.tsx` |
| FE-13-01b | ✅ APPROVED | Import `RetryButton` in `page.tsx`; no other changes |

**No conflicts. Proceed to PHASE 3.**
