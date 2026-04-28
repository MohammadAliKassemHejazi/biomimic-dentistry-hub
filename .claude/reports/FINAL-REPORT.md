# Iteration 12 — Fix Critical Build Failure: useSearchParams() Suspense Boundaries

**Team:** team-lead + frontend-expert + architect + qa-tester  
**Scope:** FE-12-01, FE-12-02 — useSearchParams() missing Suspense wrapper on two pages  
**Status:** ✅ 2/2 items applied — MERGED  
**Date:** 2026-04-28

---

## Executive Summary

The Render production build was failing with exit code 1 because two pages
(`/partnership/apply` and `/subscription`) called `useSearchParams()` at the
root of their default-export components with no `<Suspense>` boundary. Next.js
App Router requires Suspense wrapping on any component that reads search params,
because static pre-rendering cannot resolve URL query strings at build time.
Both pages were refactored using the canonical "thin shell + content child"
split pattern. The build now completes successfully and both pages behave
identically at runtime.

---

## What Changed — by Lens

### 🔑 Functional

| Fix ID | Summary | Files |
|---|---|---|
| FE-12-01 | Wrapped `useSearchParams()` in Suspense on partnership apply page | `client/src/app/partnership/apply/page.tsx` |
| FE-12-02 | Wrapped `useSearchParams()` in Suspense on subscription page | `client/src/app/subscription/page.tsx` |

### 🎨 UX / Frontend

| Fix ID | Summary | Files |
|---|---|---|
| FE-12-01 | Added centered spinner fallback during hydration on /partnership/apply | `client/src/app/partnership/apply/page.tsx` |
| FE-12-02 | Added `SubscriptionSkeleton` fallback (matches tier-card grid) during hydration on /subscription | `client/src/app/subscription/page.tsx` |

---

## Pattern Applied

```tsx
// BEFORE (broken — build exits code 1):
export default function Page() {
  const searchParams = useSearchParams(); // ← unguarded
  ...
}

// AFTER (correct — statically renderable):
function PageContent() {
  const searchParams = useSearchParams(); // ← inside Suspense child
  ...
}

export default function Page() {
  return (
    <Suspense fallback={<LoadingUI />}>
      <PageContent />
    </Suspense>
  );
}
```

---

## New Required Env Vars

None.

---

## Files Changed

### Modified files (2)
- `client/src/app/partnership/apply/page.tsx`
- `client/src/app/subscription/page.tsx`

---

## Architecture Notes

- The `"use client"` directive is retained on both files. The Suspense shell
  can safely be a client component when its only content is another client
  component.
- The `SubscriptionSkeleton` component reuses the exact Skeleton grid already
  present inside `SubscriptionContent`, ensuring visual consistency during
  the brief hydration window.
- No additional pages have unguarded `useSearchParams()` calls — confirmed by
  full codebase scan.

---

## Arbitration Decisions

None required — single agent (frontend-expert), single root cause, no conflicts.

---

## Deferred (Iteration 13 Candidates)

| ID | Description | Why deferred |
|---|---|---|
| SEC-CSP | Content-Security-Policy header | Requires full inline-script audit |
| PWA-ICONS | Dedicated maskable icon with safe-zone padding | Low urgency |
| FE-BLOG-RT | Tiptap rich-text editor for blog create/edit | Feature work |
| BE-COOKIE | HttpOnly cookie + CSRF token | Security hardening sprint |
| FE-LCP-BG | Convert heroBg CSS background to Next.js Image with priority | Performance |
| ANIM-COUNTER | Count-up animation for hero stats | Enhancement |
| ANIM-CURSOR | Custom cursor on hero section | Enhancement |

---

## Cumulative Project Health

| Metric | Before Iter 12 | After Iter 12 |
|---|---|---|
| Production build | ❌ Fails (exit code 1) | ✅ Passes |
| Render deployment | ❌ Blocked | ✅ Unblocked |
| TypeScript errors | 0 | 0 |
| Pages with unguarded useSearchParams | 2 | 0 |
