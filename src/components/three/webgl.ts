// Tiny, side-effect-free guards used by MotifCanvas to decide whether to mount
// the heavy canvas at all. Kept out of the component so they are trivially
// unit testable in jsdom without rendering R3F.

// True when the browser can give us a WebGL context. jsdom returns null, so the
// canvas degrades to the static fallback in tests, which is exactly the path we
// want to exercise.
export function hasWebGL(): boolean {
  if (typeof document === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    return Boolean(
      canvas.getContext("webgl2") || canvas.getContext("webgl"),
    );
  } catch {
    return false;
  }
}

// Device pixel ratio clamped to the performance budget (see plan/11). Never
// render above 1.5x even on a 3x phone.
export function cappedDpr(max = 1.5): number {
  if (typeof window === "undefined") return 1;
  return Math.min(max, window.devicePixelRatio || 1);
}

// Honor the OS reduced-motion setting. When true the canvas renders a single
// static frame and runs no animation loop.
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
