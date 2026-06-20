"use client";

import { useEffect, useRef, type RefObject } from "react";

const EASE = "cubic-bezier(0.16, 1, 0.3, 1)";

// Count cells sharing the top row, which is the column count.
function columns(items: HTMLElement[]): number {
  if (items.length === 0) return 0;
  const top = Math.min(...items.map((c) => c.getBoundingClientRect().top));
  return items.filter((c) => Math.abs(c.getBoundingClientRect().top - top) < 1)
    .length;
}

// iOS-like reflow: when the grid changes column count on resize, each cell
// springs from its old position to its new one (FLIP) rather than jumping.
// It animates only on a column-count change, not on every pixel of a drag, so
// continuous resize stays calm. Transform only, no layout cost. Reduced-motion
// and SSR safe (it simply does nothing).
export function useGridFlip(ref: RefObject<HTMLElement | null>) {
  const rects = useRef<Map<Element, DOMRect>>(new Map());

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof window === "undefined") return;
    if (typeof ResizeObserver === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const cells = () => Array.from(el.children) as HTMLElement[];
    const measure = () => {
      const m = new Map<Element, DOMRect>();
      for (const c of cells()) m.set(c, c.getBoundingClientRect());
      return m;
    };

    rects.current = measure();
    let cols = columns(cells());

    const ro = new ResizeObserver(() => {
      const next = columns(cells());
      if (next === cols) {
        rects.current = measure();
        return;
      }
      cols = next;
      for (const c of cells()) {
        const old = rects.current.get(c);
        if (!old) continue;
        const now = c.getBoundingClientRect();
        const dx = old.left - now.left;
        const dy = old.top - now.top;
        if (Math.abs(dx) < 1 && Math.abs(dy) < 1) continue;
        c.animate(
          [
            { transform: `translate(${dx}px, ${dy}px)` },
            { transform: "translate(0, 0)" },
          ],
          { duration: 420, easing: EASE },
        );
      }
      rects.current = measure();
    });

    ro.observe(el);
    return () => ro.disconnect();
  }, [ref]);
}
