"use client";

import { motion, type Variants } from 'framer-motion';
import { type ReactNode } from 'react';
import { useReducedMotion } from '@/hooks/useReducedMotion';

/* ── Easing ───────────────────────────────────────────────────────────── */
// Custom ease curve: fast start, soft landing — "iOS spring" feel.
const EASE = [0.22, 1, 0.36, 1] as const;

/* ── Direction offset map ─────────────────────────────────────────────── */
const OFFSETS: Record<Direction, { x?: number; y?: number }> = {
  up:    { y: 40 },
  down:  { y: -40 },
  left:  { x: 40 },
  right: { x: -40 },
  none:  {},
};

/* ── Types ────────────────────────────────────────────────────────────── */
type Direction = 'up' | 'down' | 'left' | 'right' | 'none';

interface ScrollRevealProps {
  children: ReactNode;
  /** Delay in seconds before this element starts its reveal animation. */
  delay?: number;
  /** Duration in seconds of the reveal animation. Default: 0.7 */
  duration?: number;
  /** Extra className applied to the wrapper element. */
  className?: string;
  /** Direction the element enters from. Default: 'up' */
  direction?: Direction;
  /** Whether to animate only once (true) or every time it enters (false). */
  once?: boolean;
  /** Viewport margin before triggering — negative values trigger earlier. */
  margin?: string;
}

/**
 * ScrollReveal — Wraps children in a Framer Motion scroll-triggered reveal.
 *
 * Uses `whileInView` (viewport API) — no IntersectionObserver boilerplate.
 * Always `once: true` by default so the animation doesn't re-trigger on scroll-up.
 *
 * Reduced motion: renders a plain <div> with children fully visible.
 * No animation, no opacity change — content is always accessible.
 *
 * @example
 * <ScrollReveal delay={0.2} direction="up">
 *   <SponsorCard />
 * </ScrollReveal>
 */
export function ScrollReveal({
  children,
  delay = 0,
  duration = 0.7,
  className,
  direction = 'up',
  once = true,
  margin = '-80px',
}: ScrollRevealProps) {
  const prefersReduced = useReducedMotion();

  // Accessibility-first: never animate when user has requested reduced motion.
  // Content is always visible — never hidden behind an opacity: 0 gate.
  if (prefersReduced) {
    return <div className={className}>{children}</div>;
  }

  const initial = { opacity: 0, ...OFFSETS[direction] };
  const animate = { opacity: 1, x: 0, y: 0 };

  return (
    <motion.div
      initial={initial}
      whileInView={animate}
      viewport={{ once, margin }}
      transition={{ duration, delay, ease: EASE }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ── Stagger container variant helpers ───────────────────────────────── */

/**
 * staggerContainer — Framer Motion variants for a parent that staggers children.
 *
 * @example
 * <motion.div
 *   variants={staggerContainer(0.1)}
 *   initial="hidden"
 *   whileInView="visible"
 *   viewport={{ once: true, margin: '-80px' }}
 * >
 *   {items.map(item => (
 *     <motion.div variants={staggerItem} key={item.id}>...</motion.div>
 *   ))}
 * </motion.div>
 */
export function staggerContainer(staggerDelay = 0.1, delayChildren = 0): Variants {
  return {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: staggerDelay,
        delayChildren,
      },
    },
  };
}

/**
 * staggerItem — Framer Motion variants for individual stagger children.
 * Apply to each child inside a staggerContainer parent.
 */
export const staggerItem: Variants = {
  hidden:  { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: EASE },
  },
};

/**
 * staggerItemLeft — Same as staggerItem but enters from the left.
 */
export const staggerItemLeft: Variants = {
  hidden:  { opacity: 0, x: 40 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: EASE },
  },
};

/**
 * fadeItem — Fade-only variant (no translate).
 * Good for elements that shouldn't shift — e.g. background cards.
 */
export const fadeItem: Variants = {
  hidden:  { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
};
