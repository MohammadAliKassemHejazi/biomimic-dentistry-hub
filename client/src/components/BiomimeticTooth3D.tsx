"use client";
// Re-export shim — implementation lives in ToothAnimation.tsx.
// This file is kept so any browser still holding a cached HTML reference
// to the old chunk URL does not produce a 404.
export { default } from './ToothAnimation';
