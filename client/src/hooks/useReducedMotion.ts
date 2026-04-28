"use client";

import { useEffect, useState } from 'react';

/**
 * useReducedMotion — SSR-safe hook that tracks prefers-reduced-motion.
 *
 * Returns `true` if the user has requested reduced motion.
 * Starts as `false` on the server (safe SSR default) and updates
 * to the real value after hydration.
 *
 * Usage:
 *   const prefersReduced = useReducedMotion();
 *   if (prefersReduced) return <StaticFallback />;
 *
 * This is the SINGLE source of truth for motion preference across
 * all animation components — never call window.matchMedia elsewhere.
 */
export function useReducedMotion(): boolean {
  const [prefersReduced, setPrefersReduced] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    // Sync to real value on first render
    setPrefersReduced(mql.matches);

    // Keep in sync if the user changes their OS preference at runtime
    const handleChange = (e: MediaQueryListEvent) => setPrefersReduced(e.matches);
    mql.addEventListener('change', handleChange);

    return () => mql.removeEventListener('change', handleChange);
  }, []);

  return prefersReduced;
}
