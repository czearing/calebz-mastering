"use client";

import { useCallback, useEffect, useRef } from "react";

const EASE = "cubic-bezier(0.16, 1, 0.3, 1)";

// A subtle 3D tilt toward the cursor. The transform is written straight to the
// element via a ref inside the move handler, so there is no React state and no
// re-render per pointer move (that is what makes the old scrub jitter). A short
// transition tracks the cursor smoothly; a longer one eases the card back flat
// on leave. Fine-pointer only, disabled under reduced motion and on touch.
export function useTilt(maxDeg = 6) {
  const ref = useRef<HTMLButtonElement | null>(null);
  const enabled = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    enabled.current =
      window.matchMedia("(pointer: fine)").matches &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  const onPointerMove = useCallback(
    (e: React.PointerEvent<HTMLButtonElement>) => {
      const el = ref.current;
      if (!el || !enabled.current) return;
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      el.style.transition = "transform 90ms linear";
      el.style.transform = `perspective(900px) rotateX(${(-py * 2 * maxDeg).toFixed(2)}deg) rotateY(${(px * 2 * maxDeg).toFixed(2)}deg) scale(1.025)`;
    },
    [maxDeg],
  );

  const onPointerLeave = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.transition = `transform 420ms ${EASE}`;
    el.style.transform = "perspective(900px) rotateX(0deg) rotateY(0deg) scale(1)";
  }, []);

  return { ref, onPointerMove, onPointerLeave };
}
