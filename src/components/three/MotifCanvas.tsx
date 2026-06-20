"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { cn } from "@/lib/cn";
import { MotifSurface } from "./MotifSurface";
import { MotifFallback } from "./MotifFallback";
import { hasWebGL, cappedDpr, prefersReducedMotion } from "./webgl";

export type MotifCanvasProps = {
  className?: string;
};

// The dynamic-import target. Decorative (aria-hidden) terrain behind the hero.
// Guards, in order:
//  1. No WebGL  -> render only the CSS static frame, never mount Canvas.
//  2. Reduced motion -> mount Canvas, render a single static frame, no loop.
//  3. Offscreen or tab hidden -> stop the frameloop entirely.
// The page is complete without this component; it adds nothing required.
export function MotifCanvas({ className }: MotifCanvasProps) {
  const host = useRef<HTMLDivElement>(null);
  // Resolve guards on the client only so SSR output is the static frame.
  const [supported, setSupported] = useState(false);
  const [reduced, setReduced] = useState(true);
  const [active, setActive] = useState(false);
  // Hold the canvas transparent until the surface has actually painted, so an
  // empty GL canvas never occludes the nicer CSS fallback beneath it.
  const [ready, setReady] = useState(false);
  // Track on-screen state so a visibility restore does not un-pause an
  // offscreen canvas.
  const onScreen = useRef(false);

  useEffect(() => {
    setSupported(hasWebGL());
    setReduced(prefersReducedMotion());
  }, []);

  // Pause when the element scrolls off screen, resume when it returns.
  useEffect(() => {
    const el = host.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      ([entry]) => {
        onScreen.current = entry.isIntersecting;
        setActive(entry.isIntersecting && !document.hidden);
      },
      { threshold: 0.01 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Pause when the tab is hidden, restore when it becomes visible again (only
  // if the element is still on screen).
  useEffect(() => {
    if (typeof document === "undefined") return;
    const onVis = () => {
      setActive(!document.hidden && onScreen.current);
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  const onReady = useCallback(() => setReady(true), []);

  // Animate only when supported, on screen, and motion is allowed.
  const animate = supported && active && !reduced;
  // Demand keeps the GPU idle until something invalidates: the surface feeds it
  // each frame while animating, and invalidates on scroll/pointer while idle.
  // never fully stops work once offscreen.
  const frameloop = active ? "demand" : "never";

  return (
    <div
      ref={host}
      aria-hidden="true"
      className={cn("relative h-full w-full overflow-hidden", className)}
    >
      <MotifFallback />
      {supported ? (
        <Canvas
          className={cn(
            "absolute inset-0 transition-opacity duration-700",
            ready ? "opacity-100" : "opacity-0",
          )}
          dpr={cappedDpr()}
          frameloop={frameloop}
          gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
          camera={{ position: [0, 0.6, 2.4], fov: 50 }}
        >
          <Suspense fallback={null}>
            <MotifSurface animate={animate} onReady={onReady} />
          </Suspense>
        </Canvas>
      ) : null}
    </div>
  );
}

export default MotifCanvas;
