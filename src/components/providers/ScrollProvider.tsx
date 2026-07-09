"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import dynamic from "next/dynamic";
import type { LenisRef } from "lenis/react";
import { registerScroller } from "@/lib/scrollLock";

// Lenis is loaded only when smooth scroll is actually enabled, so its code is
// dynamically imported and never ships in the home first-load bundle (plan/11).
// On mobile, touch, or reduced motion it is never fetched at all.
const ReactLenis = dynamic(
  () => import("lenis/react").then((m) => m.ReactLenis),
  { ssr: false },
);

export type ScrollProviderProps = {
  children: ReactNode;
};

// Should we smooth-scroll? Off for reduced motion and on small or touch
// viewports, to protect INP on mobile (plan/05, plan/11, plan/13). Reads the
// DOM, so it only runs client-side inside an effect.
function shouldSmooth(): boolean {
  if (typeof window === "undefined") return false;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced) return false;
  const small = window.matchMedia("(max-width: 768px)").matches;
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  return !small && !coarse;
}

// Lenis wraps native scroll on a rAF loop for 60fps (plan/03, plan/05). It runs
// as a root instance, so it drives window scroll: window.scrollY stays the
// source of truth and the Hero motif keeps reading it (readProgress), which is
// what couples scroll to the playhead morph in the Hero motif (plan/23).
//
// SSR safe: the server and first client paint render plain children (no Lenis),
// so markup matches and there is no hydration mismatch. After mount we decide
// whether to enable smooth scroll. When disabled (reduced motion, mobile, or
// touch) we stay on native scroll and the page is fully usable.
export function ScrollProvider({ children }: ScrollProviderProps) {
  const [smooth, setSmooth] = useState(false);
  // The ReactLenis ref exposes the live Lenis instance; we register it so a
  // modal can stop smooth scroll (scrollLock). Typed loosely to keep lenis out
  // of the first-load bundle.
  const lenisRef = useRef<LenisRef | null>(null);

  useEffect(() => {
    const decide = () => setSmooth(shouldSmooth());
    decide();
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    mq.addEventListener("change", decide);
    return () => mq.removeEventListener("change", decide);
  }, []);

  useEffect(() => {
    registerScroller(smooth ? (lenisRef.current?.lenis ?? null) : null);
    return () => registerScroller(null);
  }, [smooth]);

  if (!smooth) return <>{children}</>;

  // autoRaf drives the loop; root binds it to the window so native scrollY and
  // anchor jumps stay coherent with the scroll signal.
  return (
    <ReactLenis root options={{ autoRaf: true }} ref={lenisRef}>
      {children}
    </ReactLenis>
  );
}
