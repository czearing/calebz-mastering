"use client";

import { useEffect, useRef } from "react";

const EASE = "cubic-bezier(0.16, 1, 0.3, 1)";

// A subtle 3D tilt toward the cursor. Listeners attach to the element itself
// and write the transform straight to its style, so there is no React state and
// no re-render per pointer move. Fine-pointer only; disabled under reduced
// motion and on touch. Returns a ref to spread onto the target element.
export function useTilt(maxDeg = 6) {
  const ref = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const fine =
      window.matchMedia("(pointer: fine)").matches &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine) return;

    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      el.style.transition = "transform 90ms linear";
      el.style.transform = `perspective(900px) rotateX(${(-py * 2 * maxDeg).toFixed(2)}deg) rotateY(${(px * 2 * maxDeg).toFixed(2)}deg) scale(1.025)`;
    };
    const onLeave = () => {
      el.style.transition = `transform 420ms ${EASE}`;
      el.style.transform =
        "perspective(900px) rotateX(0deg) rotateY(0deg) scale(1)";
    };

    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, [maxDeg]);

  return ref;
}
