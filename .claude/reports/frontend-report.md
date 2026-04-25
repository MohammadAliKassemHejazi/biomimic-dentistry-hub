# Frontend Expert — Iteration 3 Report
Agent: frontend-expert · Iteration 3 · 2026-04-25
Scope: /client (Next.js / React / TS strict)
Focus: Admin tab rendering (U-M2), subscription success handlers, post-Iter-2 uncommitted fixes

---

## Summary
Two client-side issues remain from the Iter-2 deferred list, plus three clean uncommitted
fixes from commit fb3cb79 that need to be landed as part of this iteration.

---

## 🔴 CRITICAL — Subscription page: no success/cancel handlers after payment redirect

### Root cause
`client/src/app/subscription/page.tsx` does NOT check the URL query params after payment.

- After **Stripe checkout** Stripe redirects to: `/subscription?success=true`
- After **PayPal approval** PayPal redirects to: `/subscription?paypal_success=true&subscription_id=I-xxx`
- After **cancellation** Stripe/PayPal both redirect to: `/subscription?canceled=true`

The page ignores all these params. The user lands on a page that looks identical to before
payment, with no feedback. Combined with SV-16 (no webhooks), `subscribed` remains false and
the UI shows "no subscription" even if the user paid.

### Fix
1. On mount, read `useSearchParams()` from `next/navigation`.
2. `?success=true` → show success toast; call `refetch()` from `useSubscription` to refresh status.
3. `?paypal_success=true&subscription_id=xxx` → call `POST /api/subscriptions/paypal/confirm`,
   then show success toast; call `refetch()`.
4. `?canceled=true` → show info toast ("Payment cancelled. Your plan was not changed.").
5. Clear the query params from the address bar with `router.replace('/subscription')` after handling.

### Files affected
- `client/src/app/subscription/page.tsx`

---

## 🟠 HIGH — U-M2: Admin dashboard mounts all 9 tab panels simultaneously

### Root cause
`client/src/app/admin/page.tsx` renders all 9 `<TabsContent>` nodes in the DOM at once.
The content of each tab — including heavy table renders with potentially hundreds of rows —
is always mounted, regardless of which tab is visible.  
When any state (e.g., `applications` array) changes, React diffs all 9 panels.

### Current state
```tsx
<TabsContent value="messages">
  <div className="grid md:grid-cols-2 gap-6">
    {/* always rendered, even when "applications" tab is active */}
  </div>
</TabsContent>
```

### Fix
Wrap each TabsContent's inner content with `{activeTab === '<value>' && <.../>}`.
Data arrays (applications, users, partners, etc.) are held in the parent state so badge
counts on the TabsTriggers remain accurate regardless of which tab is mounted.
```tsx
<TabsContent value="messages">
  {activeTab === 'messages' && (
    <div className="grid md:grid-cols-2 gap-6">...</div>
  )}
</TabsContent>
```

### Files affected
- `client/src/app/admin/page.tsx`

---

## 🟢 LOW — 3 uncommitted file changes (post-Iter-2 fixes)

### ambassador/apply/page.tsx
`router.push()` was being called during render (inside `if (!user)` / `if (user.is_ambassador)`).
React 19 throws a hydration warning for side effects during render.  
Fix (already applied in working tree): moved redirect logic into `useEffect`.

### blog/[slug]/page.tsx
OG / JSON-LD `image` fields were set to a root-relative URL (`/uploads/file.jpg`).
Crawlers (LinkedIn, Google) require absolute URLs in meta image properties.  
Fix (already applied): wrapped with `absoluteUrl()` from env.ts.

### client/src/lib/env.ts
`resolveUploadUrl` JSDoc improved + `absoluteUrl` export confirmed.
No logic change, documentation only.

---

## Proposed fix set (Iteration 3, frontend)
| ID   | Fix                                         | Priority |
|------|---------------------------------------------|----------|
| F-W1 | Subscription success/cancel URL param handlers | CRITICAL |
| U-M2 | Admin tab conditional rendering             | HIGH     |
| —    | Commit 3 pre-existing clean working-tree fixes | LOW   |

**Frontend Iter-3 analysis complete.** → team-lead
