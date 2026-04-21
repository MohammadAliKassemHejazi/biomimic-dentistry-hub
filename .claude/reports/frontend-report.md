# Frontend Expert — Investigation Report
Agent: frontend-expert · Iteration 1 · 2026-04-21
Scope: `/client` (Next.js 16 / React 19 / TS strict)

## Summary
Found **19 issues** in `/client`. Most severe: a hard-coded role hook that entirely bypasses role-based UI gating, a mocked Supabase client that's dead code but still imported-adjacent, and several production bundles shipping `http://localhost:5000` fallbacks.

---

## 🔴 CRITICAL

### FE-01 · `useUserRole` returns hard-coded `'admin'` for every user
**File:** `client/src/hooks/useUserRole.ts:8`
```ts
const [role, setRole] = useState<AppRole>('admin');   // ← mock never replaced
```
- `hasRole`, `isAdmin`, `isVip`, `isAmbassador` all derive from this mock.
- Any component that gates on this hook (instead of `useAuth().user?.role`) exposes admin UI to everyone.
- Backend still enforces at API layer, so data isn't leaked — but the UX is broken and misleading.

**Fix (before → after):**
```ts
// BEFORE
export const useUserRole = () => {
  const [role, setRole] = useState<AppRole>('admin');
  // ...
};

// AFTER
import { useAuth } from '@/contexts/AuthContext';
export const useUserRole = () => {
  const { user, loading } = useAuth();
  const role: AppRole =
    user?.role === 'admin' ? 'admin'
    : user?.is_ambassador || user?.role === 'ambassador' ? 'ambassador'
    : (['bronze','silver','vip','gold'] as const).includes(user?.role as any) ? 'vip'
    : 'user';
  const hasRole = useCallback((required: AppRole) => {
    const h: Record<AppRole, number> = { user:1, vip:2, ambassador:3, admin:4 };
    return h[role] >= h[required];
  }, [role]);
  return { role, loading, hasRole,
    isAdmin: role === 'admin',
    isAmbassador: role === 'ambassador' || role === 'admin',
    isVip: role !== 'user',
    refreshRole: () => {} };
};
```

---

## 🟠 HIGH

### FE-02 · Localhost fallbacks leak into production bundle
**Files:**
- `client/src/lib/api.ts:4` → `'http://localhost:5000/api'`
- `client/src/components/SponsorsSection.tsx:49`
- `client/src/components/VIPSection.tsx:43`
- `client/src/app/admin/page.tsx:144`
- `client/src/app/blog/[slug]/page.tsx:41`

At build time on Render, `NEXT_PUBLIC_API_URL` is inlined. If it ever fails to be set, the bundle ships with `localhost:5000`, which fails silently in prod.

**Fix:** create `client/src/lib/env.ts`:
```ts
export const API_URL = (() => {
  const v = process.env.NEXT_PUBLIC_API_URL;
  if (!v) throw new Error('NEXT_PUBLIC_API_URL is not set — refusing to build');
  return v;
})();
export const SERVER_ORIGIN = API_URL.replace(/\/api\/?$/, '');
```
Then replace the fallbacks everywhere with imports.

### FE-03 · JWT stored in non-HttpOnly cookie (XSS = full account takeover)
**File:** `client/src/contexts/AuthContext.tsx:77,106`
```ts
Cookies.set('token', token, { expires: 7 });   // readable by any JS
```
No `secure`, no `sameSite`, no `httpOnly`. The token is set from JS, which is inherently XSS-exposed.

**Fix (short-term, minimal scope):**
```ts
Cookies.set('token', token, {
  expires: 7,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
});
```
Track as tech-debt: move to HttpOnly server-set cookie + CSRF token. Outside this iteration's blast radius.

### FE-04 · Next.js `remotePatterns` allows any host
**File:** `client/next.config.ts:29-35`
```ts
{ protocol: 'https', hostname: '**' },
{ protocol: 'http',  hostname: '**' },
```
Any URL the backend hands you renders via `next/image` optimizer. SSRF-lite surface.

**Fix:** replace with explicit allow-list. For self-served uploads, rely on the `/uploads/*` rewrite (already in config) and only list the CDN + known hosts.

### FE-05 · Admin dashboard breaks entirely if any of 11 parallel fetches fails
**File:** `client/src/app/admin/page.tsx:166-178`
```ts
const [...] = await Promise.all([ api.get(...), ...×11 ]);
```
If the cache endpoint is cold or one of the admin routes 500s, the whole dashboard stays on the loader forever.

**Fix:** switch to `Promise.allSettled` and log/skip the failed panels individually.

### FE-06 · Blog-post view is never recorded for guests
**File:** `client/src/app/blog/[slug]/page.tsx:64-68`
```ts
if (post?.id && !viewRecorded && isAuthenticated) { recordView(post.id); }
```
Backend `recordView` supports IP-based dedupe for anonymous users. Gating on `isAuthenticated` throws away those views.

**Fix:** drop the `isAuthenticated` condition.

### FE-07 · Subscription page: Stripe opens in new tab, PayPal redirects same tab
**File:** `client/src/app/subscription/page.tsx:183 / 199`
Inconsistent UX — Stripe `window.open(url, '_blank')`, PayPal `window.location.href = url`. On a failed Stripe popup block, user sees nothing.

**Fix:** use same-tab redirect for both; or always open in new tab.

### FE-08 · Dead mock `supabase.ts` still exported
**File:** `client/src/lib/supabase.ts`
Entire file is a mock that always returns `null` — no imports under `client/src/**` reference it after grepping. Keeping it around invites accidental re-adoption.

**Fix:** delete the file. Confirm no imports.

### FE-09 · Legacy `'gold'` branches in role checks
**Files:** `client/src/components/Navigation.tsx:129,131,296,309`, `client/src/hooks/useUserRole.ts` indirectly, `dashboard/page.tsx:91`.
Backend enum has `UserRole.VIP`; `gold` is not written. These branches are dead but create confusion for next dev.

**Fix:** drop `'gold'` branches, or keep one unified compatibility layer in the User type mapper at AuthContext level (already exists lines 49/72/102).

---

## 🟡 MEDIUM

### FE-10 · `AuthContext.checkUser` has no cleanup on unmount
**File:** `client/src/contexts/AuthContext.tsx:34-59`
If user navigates away during the in-flight `/users/profile` call, `setLoading(false)` fires on an unmounted component. React 19 tolerates this, but better to guard.

### FE-11 · `useBlogPosts` handles two response shapes defensively
**File:** `client/src/hooks/queries/useBlog.ts:27`
```ts
return Array.isArray(res) ? res : (res as {data:BlogPost[]}).data ?? [];
```
This indicates an inconsistent contract — server `getPosts` returns `{data, meta}` consistently. Defensive code hides the fact. See architect note — this is evidence that the contract isn't strict on either side.

### FE-12 · `Footer` newsletter POST bypasses `api` helper
**File:** `client/src/components/Footer.tsx:16`
Bypasses toast/error handling. Minor inconsistency.

### FE-13 · `useResources` double-gates auth
**File:** `client/src/hooks/queries/useResources.ts:20`
Reads `Cookies.get('token')` directly; should use `useAuth().isAuthenticated`.

### FE-14 · `login/page.tsx` shows only `title: 'Failed'` toast with no body on error
**File:** `client/src/app/login/page.tsx:26-29`
No message → user doesn't know why.

**Fix:** pass `description: error.message`.

### FE-15 · `subscription/page.tsx:167` shows `title: 'Failed'` for "not authenticated"
Misleading — should say "Please sign in to subscribe" and link to `/login`.

---

## 🟢 LOW
- FE-16 `error.tsx` logs error to `console.error` only; no Sentry/logger wired (intentional TODO).
- FE-17 `BlogPost` interface in `useBlog.ts:17` marks `profiles` required but list endpoint may omit `author` include (it includes it, so OK — kept for visibility).
- FE-18 `Providers.tsx` uses `useState(() => new QueryClient(...))` correctly — good.
- FE-19 `Navigation.tsx` has many dropdown items repeated for mobile/desktop — refactor candidate.

---

## Proposed fix set (awaiting team-lead approval)
I propose to apply, this iteration:
- **FE-01** (useUserRole mock → real)
- **FE-02** (localhost fallbacks → env helper)
- **FE-03** (JWT cookie flags — minimal)
- **FE-04** (next.config remotePatterns)
- **FE-05** (Promise.allSettled in admin page)
- **FE-06** (drop isAuthenticated guard on view record)
- **FE-07** (Stripe same-tab redirect)
- **FE-08** (delete supabase.ts)
- **FE-10** (cleanup flag)
- **FE-14 / FE-15** (toast messages)

Defer to follow-up iteration:
- Full HttpOnly-cookie migration + CSRF (needs backend coordination)
- Footer → `api` helper refactor
- Navigation dead-role cleanup

**Frontend analysis complete.** → team-lead
