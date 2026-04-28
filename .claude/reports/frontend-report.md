# Frontend Expert Report — Iteration 11

**Agent:** frontend-expert  
**Date:** 2026-04-27  
**Scope:** Site-wide Framer Motion interactivity, scroll reveals, page transitions, scroll progress

---

## Summary

Files scanned: all `/client/src` pages + components. framer-motion `^12.34.0` installed — full `whileInView`, `AnimatePresence`, `useScroll`, `useSpring`, `useTransform` API available.

| Severity | Count |
|---|---|
| HIGH | 2 (no scroll reveals, no page transitions) |
| MEDIUM | 3 (no scroll progress, no scroll-aware nav, no footer entrance) |
| LOW | 0 |

---

## Findings

### [HIGH] FE-FRAMER-01 — No scroll-triggered reveal animations site-wide

**Root cause:** `SponsorsSection` and `VIPSection` use static CSS classes `fade-in-up stagger-N`. These have no IntersectionObserver — all elements render fully immediately on load. No progressive reveal = low perceived interactivity.

**Fix:**
- New shared hook `useReducedMotion.ts`
- New reusable `ScrollReveal.tsx` component using `whileInView` + stagger variants
- `SponsorsSection`: section header + sponsor cards + CTA staggered reveal
- `VIPSection`: leadership cards + pricing cards + benefit tiles staggered reveal
- Footer: fade-in from bottom

**Status:** ✅ Applied.

---

### [HIGH] FE-FRAMER-02 — No page transition animations

**Root cause:** Next.js App Router route changes are instant — hard cuts with no animation. Users experience jarring flashes between pages.

**Fix:** New `MotionLayout.tsx` client component wrapping `children` in `AnimatePresence` keyed by `usePathname()`. Slide + fade: page exits left, next page enters from right. 300ms. Integrated in `layout.tsx`.

**Status:** ✅ Applied.

---

### [MEDIUM] FE-FRAMER-03 — No scroll progress indicator

**Root cause:** Long-form pages (courses, blog) have no reading progress cue.

**Fix:** New `ScrollProgress.tsx` — `motion.div` with `scaleX` driven by `useSpring(scrollYProgress)`. Gradient: `from-primary via-secondary to-accent`. Fixed at top of viewport, z-index above navigation. `prefers-reduced-motion` guard (returns null if reduced).

**Status:** ✅ Applied.

---

### [MEDIUM] FE-FRAMER-04 — Navigation scroll-state has no visual change

**Root cause:** Navigation renders identically at top and when scrolled. No depth cue for "user has scrolled" state.

**Fix:** `useScroll` + `scrollY.on('change')` listener in Navigation. Adds `border-b border-white/20 bg-primary/98 backdrop-blur-md` class when `scrollY > 10`. Smooth CSS transition.

**Status:** ✅ Applied.

---

### [MEDIUM] FE-FRAMER-05 — Footer has no entrance animation

**Root cause:** Footer appears immediately when scrolled to. No reveal animation.

**Fix:** `motion.footer` with `whileInView={{ opacity: 1 }}` fade from 0 → 1 over 0.8s. `once: true`.

**Status:** ✅ Applied.

---

## New Files

| File | Purpose |
|---|---|
| `client/src/hooks/useReducedMotion.ts` | SSR-safe `prefers-reduced-motion` hook |
| `client/src/components/ScrollProgress.tsx` | Scroll progress bar |
| `client/src/components/ScrollReveal.tsx` | Reusable scroll-reveal wrapper |
| `client/src/components/MotionLayout.tsx` | Page transition AnimatePresence wrapper |

## Modified Files

| File | What changed |
|---|---|
| `client/src/components/SponsorsSection.tsx` | Framer Motion stagger reveal + card hover lift |
| `client/src/components/VIPSection.tsx` | Framer Motion stagger reveal + pricing card pop |
| `client/src/components/Footer.tsx` | motion.footer whileInView fade |
| `client/src/components/Navigation.tsx` | scroll-aware border + backdrop-blur |
| `client/src/components/HeroSection.tsx` | scroll parallax + ToothAnimation entrance |
| `client/src/app/layout.tsx` | ScrollProgress + MotionLayout integration |

## Dependencies

No new npm packages. All features use `framer-motion ^12.34.0` which is already installed.
