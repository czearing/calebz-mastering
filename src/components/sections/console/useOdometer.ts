"use client";

import { useEffect, useRef, useState } from "react";

const DURATION_MS = 380;

// Ease the brief specifies for the digit roll, as a JS curve.
function easeOutQuint(t: number): number {
  return 1 - Math.pow(1 - t, 5);
}

function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches === true
  );
}

// Tween an integer toward target over 380ms with requestAnimationFrame, no
// dependency. Reduced motion (or no rAF) swaps instantly so the number is
// always correct without animation. Returns the current displayed value.
export function useOdometer(target: number): number {
  const [value, setValue] = useState(target);
  const fromRef = useRef(target);
  const startRef = useRef(0);
  const rafRef = useRef(0);

  useEffect(() => {
    if (
      prefersReducedMotion() ||
      typeof requestAnimationFrame === "undefined"
    ) {
      setValue(target);
      return;
    }

    fromRef.current = value;
    startRef.current = 0;
    const from = fromRef.current;
    const delta = target - from;
    if (delta === 0) return;

    const tick = (now: number) => {
      if (startRef.current === 0) startRef.current = now;
      const elapsed = now - startRef.current;
      const t = Math.min(1, elapsed / DURATION_MS);
      const next = Math.round(from + delta * easeOutQuint(t));
      setValue(next);
      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        setValue(target);
      }
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
    // value is intentionally read once at the start of each new tween, not a
    // dependency, so a new target restarts the roll from the current display.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target]);

  return value;
}
