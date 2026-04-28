# Frontend Expert Report — Iteration 14

**Agent:** frontend-expert  
**Date:** 2026-04-28  
**Status:** ANALYSIS COMPLETE

---

## Issue Found

### FE-14-01 — User appears logged out on page refresh when server returns 500
**Severity:** HIGH — Poor UX caused by cascading BE error  
**File:** `client/src/contexts/AuthContext.tsx` — line 84

**Root cause:**
`checkUser()` catch block has correct logic for NOT clearing the token on 500
(lines 79–83), but line 84 calls `setUser(null)` unconditionally for ALL errors:

```tsx
} catch (error: any) {
  const isAuthFailure = error?.status === 401 || error?.status === 403;
  if (isAuthFailure) {
    Cookies.remove('token');
    clearRoleCookie();
  }
  setUser(null);  // ← runs even on 500 / network error → user appears logged out
}
```

`isAuthenticated` is computed as `!!user`, so `setUser(null)` → `isAuthenticated = false`
→ every route guard and conditional render treats the user as anonymous, even though
their token cookie is still valid and the server will recover.

**Required fix:**
Move `setUser(null)` inside the `if (isAuthFailure)` block. On 5xx or network
errors, preserve the existing user state — null on first load (same UX as now),
but correctly preserves user identity on mid-session transient errors.

---

## Fix Plan

| ID | File | Change | Risk |
|---|---|---|---|
| FE-14-01 | `client/src/contexts/AuthContext.tsx` | Move `setUser(null)` inside `isAuthFailure` guard | Low |
