"use client";

import { useEffect, useState } from "react";

// Distance scrolled past the top before the cue retires, in CSS px. Small, so
// the cue hands off as soon as the master pass begins (plan/24 A).
const THRESHOLD_PX = 48;

function atTop(): boolean {
  if (typeof window === "undefined") return true;
  return window.scrollY <= THRESHOLD_PX;
}

// Whether the ScrollCue should be visible: true near the top of the page, false
// once scrolled past a small threshold, and true again on the return to rest.
// SSR safe (starts visible, only reads window inside an effect) and rAF
// throttled so a flick of scroll never thrashes React state. Reduced motion is
// handled by the consuming component; this hook only owns the boolean.
export function useScrollCue(): boolean {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;
    let raf = 0;
    // Coalesce scroll bursts to one read per frame, and schedule a frame only
    // when scrolling actually happens, no idle rAF loop spinning at rest.
    const tick = () => {
      raf = 0;
      setVisible((prev) => {
        const next = atTop();
        return next === prev ? prev : next;
      });
    };
    const onScroll = () => {
      if (!raf) raf = window.requestAnimationFrame(tick);
    };
    setVisible(atTop());
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      if (raf) window.cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return visible;
}
