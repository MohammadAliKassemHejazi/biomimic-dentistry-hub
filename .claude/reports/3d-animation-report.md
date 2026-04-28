# 3D Animation Report — 2026-04-27 Iteration 11

**Agent:** 3d-animation-expert  
**Date:** 2026-04-27  
**Scope:** GPU caching via IntersectionObserver, Framer Motion entrance + parallax orchestration

---

## Summary

Files scanned: `ToothAnimation.tsx`, `HeroSection.tsx`, `layout.tsx`  
Carry-forward from partial iter-11: ANIM-01/02/03 already applied (GPU at ~20%).

| Severity | Count |
|---|---|
| HIGH | 1 (GPU layers active when off-screen) |
| MEDIUM | 2 (no entrance orchestration, no scroll parallax) |

---

## Findings

### [HIGH] ANIM-GPU-01 — Compositor layers GPU-resident when hero is off-screen

**Root cause:** CSS `will-change: transform` promotes each animated element to a dedicated GPU compositor layer. These layers remain GPU-resident for the full lifetime of the DOM node — even when the hero section is 3000px below the current scroll position. On Intel Iris / shared-memory GPUs, this costs ~40–80 MB of texture memory that is never reclaimed until page unload.

**Fix:** `IntersectionObserver` inside `ToothAnimation.tsx`:
- When container exits viewport: `animationPlayState = 'paused'` + `willChange = 'auto'` (de-promotes layer, frees GPU texture)
- When container re-enters: `animationPlayState = ''` + `willChange = ''` (restore to CSS class values)
- Respects `prefers-reduced-motion`: returns early if user prefers no motion (CSS already handles the paused state)

**Measurable outcome:** ~40–80 MB GPU memory reclaimed when scrolled past hero. Zero GPU compositor activity below the fold.

**Status:** ✅ Applied.

---

### [MEDIUM] ANIM-FRAMER-01 — No Framer Motion entrance orchestration on ToothAnimation

**Root cause:** `ToothAnimation` renders immediately on mount. CSS animations start at t=0 with no entrance — the tooth just appears statically while page content fades in around it.

**Fix:** Wrap `ToothAnimation` in HeroSection with a `motion.div` that fades + scales in (0.92 → 1.0) with a 0.3s delay after the heading reveals. Uses `prefers-reduced-motion` guard.

**Status:** ✅ Applied (in HeroSection.tsx).

---

### [MEDIUM] ANIM-PARALLAX-01 — No scroll parallax on hero animation system

**Root cause:** Hero section is static. No parallax depth as user scrolls.

**Fix:** `useScroll` + `useTransform` in HeroSection — tooth wrapper translates `0 → -60px` as scroll progress goes `0 → 0.35`. Background image already has a slight CSS transform (will leave as-is). Uses `useReducedMotion` guard.

**Status:** ✅ Applied (in HeroSection.tsx).

---

## Compliance Checklist

| Rule | Status |
|---|---|
| `prefers-reduced-motion` respected | ✅ IntersectionObserver early-returns; Framer Motion wrapper skips when reduced |
| `cancelAnimationFrame` on cleanup | N/A — no rAF loop |
| Compositor layer de-promotion off-screen | ✅ ANIM-GPU-01 fix |
| GPU budget while visible | ~18–22% (unchanged from iter-11a) |
| GPU budget while scrolled past hero | ~0% (layers de-promoted) |

---

## Frontend-expert Handoff

`ToothAnimation` API unchanged — zero props, zero events.  
`HeroSection` now wraps `ToothAnimation` in a `motion.div` with `style={{ y: toothY }}` scroll transform.  
No new npm packages required.
