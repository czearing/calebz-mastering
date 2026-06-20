"use client";

import { useEffect, useRef, useState } from "react";

// Normalized scroll progress 0..1 over the whole document plus a damped
// velocity signal. SSR safe: starts at zero, only reads window inside an
// effect. Two ways to read it:
//  - useScrollSignal(): React state, gated by `enabled` so the rAF loop is
//    fully dead when the canvas is paused/offscreen/reduced-motion.
//  - readProgress(): a pure synchronous read for callers that sample inside an
//    existing loop (R3F useFrame) and want no React setState per frame.
export type ScrollSignal = {
  // 0 at the top of the page, 1 at the bottom of scrollable content.
  progress: number;
  // Smoothed scroll speed, roughly 0 at rest, signed by direction.
  velocity: number;
};

export function readProgress(): number {
  if (typeof window === "undefined") return 0;
  const doc = document.documentElement;
  const max = doc.scrollHeight - window.innerHeight;
  if (max <= 0) return 0;
  return Math.min(1, Math.max(0, window.scrollY / max));
}

// `enabled` gates the loop: when false no rAF is scheduled and no setState ever
// fires, so a paused canvas does zero per-frame work. Defaults to true so the
// hook stays drop-in for any caller (and the unit tests) that omit it.
export function useScrollSignal(enabled = true): ScrollSignal {
  const [signal, setSignal] = useState<ScrollSignal>({
    progress: 0,
    velocity: 0,
  });
  const last = useRef(0);
  const vel = useRef(0);

  useEffect(() => {
    if (typeof window === "undefined" || !enabled) return;
    let raf = 0;
    let dirty = true;
    const onScroll = () => {
      dirty = true;
    };
    const tick = () => {
      if (dirty) {
        dirty = false;
        const progress = readProgress();
        const raw = progress - last.current;
        last.current = progress;
        // Exponential smoothing so a single flick decays instead of spiking.
        vel.current = vel.current * 0.8 + raw * 0.2;
        setSignal({ progress, velocity: vel.current });
      } else {
        vel.current *= 0.9;
      }
      raf = window.requestAnimationFrame(tick);
    };
    last.current = readProgress();
    setSignal({ progress: last.current, velocity: 0 });
    window.addEventListener("scroll", onScroll, { passive: true });
    raf = window.requestAnimationFrame(tick);
    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
    };
  }, [enabled]);

  return signal;
}
