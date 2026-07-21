import { gsap } from 'gsap';

/**
 * Motion layer — GSAP, configured once for the whole app.
 *
 * Rules (from the design skills):
 *  - UI transitions live in the 150–300ms band; expressive moments may go longer.
 *  - Respect the user's reduced-motion preference: timelines collapse to
 *    near-instant so nothing is hidden behind animation.
 *
 * Usage: `import { gsap, MOTION } from '@/lib/motion'` — never import 'gsap'
 * directly, so the reduced-motion guard always applies.
 */

const prefersReducedMotion =
  typeof window !== 'undefined' &&
  window.matchMedia &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (prefersReducedMotion) {
  gsap.globalTimeline.timeScale(100); // effectively instant, layout still settles
}

export const MOTION = {
  reduced: prefersReducedMotion,
  fast: 0.18,
  base: 0.26,
  slow: 0.45,
  ease: 'power2.out',
  easeIn: 'power2.in',
  spring: 'back.out(1.4)',
} as const;

export { gsap };
