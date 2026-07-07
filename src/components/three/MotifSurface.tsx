"use client";

import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import type { ShaderMaterial } from "three";
import { MotifMaterial } from "./MotifMaterial";
import { generateTerrain } from "./terrainData";
import { readProgress } from "./scrollProgress";

export type MotifSurfaceProps = {
  // When true, advance uTime per frame. When false (reduced motion or a single
  // demand render) the surface is drawn once with time frozen.
  animate: boolean;
  // Whether the canvas is on screen (and the tab visible). When false the scroll
  // listener stays detached, so scrolling the rest of the page never forces a
  // demand render of the off-screen hero canvas.
  active: boolean;
  // Called the first time the surface has painted real output so the parent can
  // reveal the canvas over the CSS fallback.
  onReady?: () => void;
};

const EPS = 0.001;

// The R3F scene content. Lives inside <Canvas>. Owns no DOM, no guards: those
// belong to MotifCanvas. It maps scroll and pointer onto the material uniforms
// imperatively (no React setState per frame) and invalidates the demand
// frameloop whenever progress or pointer moves so the morph keeps advancing.
export function MotifSurface({ animate, active, onReady }: MotifSurfaceProps) {
  const terrain = generateTerrain();
  const material = useRef<ShaderMaterial>(null);
  const progress = useRef(readProgress());
  const pointer = useRef<[number, number]>([0, 0]);
  const time = useRef(0);
  const painted = useRef(false);
  const { invalidate } = useThree();

  // Free the GPU height field when the surface unmounts.
  useEffect(() => () => terrain.dispose(), [terrain]);

  // Re-render whenever scroll changes while paused so the morph still advances
  // on a demand frameloop without the idle loop running. Only while on screen:
  // when the hero is scrolled away `active` is false and the listener detaches,
  // so scrolling the rest of the page costs zero GL renders.
  useEffect(() => {
    if (typeof window === "undefined" || !active) return;
    const onScroll = () => {
      const next = readProgress();
      if (Math.abs(next - progress.current) > EPS) invalidate();
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [invalidate, active]);

  useFrame((state, delta) => {
    const mat = material.current;
    if (!mat) return;
    const u = mat.uniforms;

    const nextProgress = readProgress();
    const px = state.pointer.x;
    const py = state.pointer.y;
    const moved =
      Math.abs(nextProgress - progress.current) > EPS ||
      Math.abs(px - pointer.current[0]) > EPS ||
      Math.abs(py - pointer.current[1]) > EPS;

    progress.current = nextProgress;
    pointer.current = [px, py];
    u.uProgress.value = nextProgress;
    u.uPointer.value = pointer.current;

    if (animate) {
      time.current += delta;
      u.uTime.value = time.current;
      invalidate();
    } else if (moved) {
      // Pointer/scroll moved but the idle loop is off: keep the morph alive.
      invalidate();
    }

    if (!painted.current) {
      painted.current = true;
      onReady?.();
    }
  });

  return (
    <mesh rotation={[-Math.PI / 2.6, 0, 0]} position={[0, -0.2, 0]}>
      <planeGeometry args={[4, 4, 128, 128]} />
      <MotifMaterial ref={material} terrain={terrain} />
    </mesh>
  );
}
