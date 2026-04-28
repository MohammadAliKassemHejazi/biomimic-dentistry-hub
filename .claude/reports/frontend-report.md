# Frontend Expert Report — Iteration 12

**Agent:** frontend-expert  
**Date:** 2026-04-28  
**Status:** ANALYSIS COMPLETE

---

## Critical Issues Found (2 files)

### FE-12-01 — useSearchParams() not wrapped in Suspense — /partnership/apply
**Severity:** CRITICAL — Build-blocking  
**File:** `client/src/app/partnership/apply/page.tsx` — line 48

`useSearchParams()` is called directly at the top level of the default export
`PartnerApplyPage`. During static page generation (`next build`), Next.js cannot
resolve search-param values; with no `<Suspense>` boundary present, the SSR
runtime throws and the entire build exits with code 1.

**Root cause pattern:**
```tsx
export default function PartnerApplyPage() {
  const searchParams = useSearchParams();  // ← unguarded
  ...
}
```

**Required fix:** Extract all useSearchParams-dependent logic into a child
component (`PartnerApplyContent`) and render it inside `<Suspense>` in the
thin shell default export.

---

### FE-12-02 — useSearchParams() not wrapped in Suspense — /subscription
**Severity:** CRITICAL — Build-blocking (would surface on next deploy if FE-12-01 alone is fixed)  
**File:** `client/src/app/subscription/page.tsx` — line 132

Same anti-pattern. The `Subscription` component calls `useSearchParams()` at
its top level; it is the default export — no Suspense boundary exists above it.

**Root cause pattern:**
```tsx
const Subscription = () => {
  const searchParams = useSearchParams();  // ← unguarded
  ...
}
export default Subscription;
```

**Required fix:** Extract `Subscription` body into `SubscriptionContent`,
wrap with `<Suspense>` in a new thin default export.

---

## Full Scan Results

All other pages/components scanned — no additional `useSearchParams` calls found
outside these two files.

---

## Fix Plan

| ID | File | Change | Risk |
|---|---|---|---|
| FE-12-01 | `client/src/app/partnership/apply/page.tsx` | Split into `PartnerApplyContent` + Suspense shell | Low |
| FE-12-02 | `client/src/app/subscription/page.tsx` | Split into `SubscriptionContent` + Suspense shell | Low |
