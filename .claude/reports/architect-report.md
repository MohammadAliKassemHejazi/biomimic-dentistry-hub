# Architect Report — Iteration 11

**Agent:** architect  
**Date:** 2026-04-27  
**Status:** ✅ APPROVED WITH CONDITIONS

---

## Cross-Cutting Review

No API contract changes. Backend untouched. All changes are client-side only.

---

## Approvals

### ✅ ANIM-GPU-01 — IntersectionObserver GPU cache
APPROVED. IntersectionObserver must disconnect on component unmount (memory leak prevention). Must check `prefers-reduced-motion` before overriding `animationPlayState` so the reduced-motion CSS is not overridden by JS.

### ✅ FE-FRAMER-01 — Scroll reveals
APPROVED WITH CONDITION: `whileInView` must use `viewport={{ once: true }}` — never re-trigger on scroll-up (causes jitter). All stagger parents must use `initial="hidden"` + `whileInView="visible"` pattern to avoid FOUC.

### ✅ FE-FRAMER-02 — Page transitions
APPROVED WITH CONDITION: AnimatePresence must be `mode="wait"` to prevent old and new pages rendering simultaneously. Keep transition short (≤ 300ms) — longer transitions feel slow on navigating between data-heavy pages.

### ✅ FE-FRAMER-03 — Scroll progress
APPROVED. Must be `aria-hidden="true"` — purely decorative.

### ✅ FE-FRAMER-04 — Nav scroll-awareness
APPROVED. Use `scrollY.on('change')` (framer-motion reactive value) not `window.addEventListener('scroll')` — avoids double listener + auto-unsubscribes.

### ✅ ANIM-FRAMER-01 + ANIM-PARALLAX-01 — HeroSection parallax
APPROVED WITH CONDITION: Parallax must use `useTransform` (not direct state updates in scroll listener) to stay on compositor thread. ToothAnimation parallax wrapper must NOT have `will-change: transform` set permanently — only via CSS class inside the component.

---

## Architecture Notes

1. **`useReducedMotion.ts` is the single source of truth** — no inline `window.matchMedia` calls elsewhere.
2. **`ScrollReveal.tsx` renders a plain `<div>` when reduced motion is active** — no motion wrapper, no opacity change, children are always visible.
3. **Page transitions**: `MotionLayout` is a client component — layout.tsx (server) imports it fine. The `key={pathname}` pattern is correct for App Router.
4. **No new dependencies** — all features use installed framer-motion v12.

---

## Conflicts
None between frontend-expert and 3d-animation-expert scope.
