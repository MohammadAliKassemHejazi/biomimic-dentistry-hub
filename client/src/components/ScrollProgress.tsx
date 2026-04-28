"use client";

import { useScroll, useSpring, motion } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';

/**
 * ScrollProgress — A fixed gradient bar at the top of the viewport
 * that tracks how far the user has scrolled down the page.
 *
 * Technique:
 *   • `useScroll()` from framer-motion returns `scrollYProgress` (0–1).
 *   • `useSpring` smooths it so the bar glides rather than snaps.
 *   • `scaleX` on `origin-left` — scales from 0% to 100% width.
 *   • Lives above the navigation (z-[200]).
 *   • aria-hidden — purely decorative, no semantic meaning.
 *   • Returns null when user prefers reduced motion.
 *
 * GPU cost: single compositor layer, opacity + scaleX only — 0 repaint.
 */
export default function ScrollProgress() {
  const prefersReduced = useReducedMotion();
  const { scrollYProgress } = useScroll();

  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  if (prefersReduced) return null;

  return (
    <motion.div
      aria-hidden="true"
      className="fixed top-0 left-0 right-0 h-[3px] origin-left z-[200]"
      style={{
        scaleX,
        background: 'linear-gradient(90deg, var(--color-primary, #88C9A1) 0%, var(--color-secondary, #B5E2FA) 50%, #E8B4B8 100%)',
      }}
    />
  );
}
