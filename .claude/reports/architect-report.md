# Architect Report — Iteration 12

**Agent:** architect  
**Date:** 2026-04-28  
**Status:** APPROVED — No conflicts

---

## Review of frontend-report.md

Both FE-12-01 and FE-12-02 are correctly diagnosed. The fix pattern is
well-established in the Next.js App Router docs:

> Any component using `useSearchParams()` must be wrapped in a `<Suspense>`
> boundary, otherwise Next.js cannot statically pre-render the page.

### Architectural guidance for both fixes

1. **Split pattern** — The "thin shell + content child" split is the canonical
   Next.js solution. The shell only renders `<Suspense>`, making the page
   statically renderable. The content component holds all runtime logic.

2. **Fallback UI** — The Suspense `fallback` should be visually consistent
   with the page's initial load state:
   - `/partnership/apply` → simple centered spinner (page is form-heavy,
     full skeleton not required)
   - `/subscription` → re-use the existing `Skeleton` loader pattern already
     in the file (already renders skeletons for `loadingTiers`)

3. **No contract changes** — Neither fix touches any API call, prop interface,
   or shared component. Backend is not impacted.

4. **`"use client"` directive** — Must remain on BOTH the content component
   AND (optionally) the shell. Since the shell renders a client component as
   its only child, placing `"use client"` on the shell is fine and maintains
   the same bundle boundary.

5. **Import of `Suspense`** — Must import `Suspense` from `react` (not from
   next/navigation). `import React, { Suspense } from 'react'` or
   `import { Suspense } from 'react'`.

---

## Decision

| Fix | Decision | Condition |
|---|---|---|
| FE-12-01 | ✅ APPROVED | Suspense fallback: centered spinner |
| FE-12-02 | ✅ APPROVED | Suspense fallback: same skeleton grid already in the component |

**No conflicts found. No deferred items. Proceed to PHASE 3.**
