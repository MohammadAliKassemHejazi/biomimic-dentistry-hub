"use client";

import { AnimatePresence, motion } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { type ReactNode } from 'react';
import { useReducedMotion } from '@/hooks/useReducedMotion';

/**
 * MotionLayout — Page transition wrapper for Next.js App Router.
 *
 * Architecture:
 *   • `AnimatePresence mode="wait"` ensures the exiting page fully
 *     disappears before the entering page renders — prevents visual overlap.
 *   • `key={pathname}` — framer-motion detects key changes and runs
 *     exit → enter sequence automatically.
 *   • Transition: fade + subtle Y shift (12px). 280ms total.
 *   • Reduced motion: renders children directly with no wrapper.
 *
 * This is a CLIENT component imported into layout.tsx (server component).
 * Next.js handles the boundary correctly.
 *
 * GPU cost: opacity + translateY only — compositor thread, 0 repaint.
 */

const PAGE_VARIANTS = {
  initial:  { opacity: 0, y: 12 },
  enter:    { opacity: 1, y: 0 },
  exit:     { opacity: 0, y: -8 },
};

const PAGE_TRANSITION = {
  type: 'tween' as const,
  ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
  duration: 0.28,
};

export default function MotionLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const prefersReduced = useReducedMotion();

  if (prefersReduced) {
    return <>{children}</>;
  }

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        variants={PAGE_VARIANTS}
        initial="initial"
        animate="enter"
        exit="exit"
        transition={PAGE_TRANSITION}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
