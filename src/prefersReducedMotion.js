/**
 * Whether the visitor's OS setting asks for less motion. Guarded because jsdom (in tests) and
 * some older browsers do not implement matchMedia.
 */
export const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

export function prefersReducedMotion() {
  if (typeof window.matchMedia !== 'function') return false;
  return window.matchMedia(REDUCED_MOTION_QUERY).matches;
}
