"use client";

import { forwardRef } from "react";
import { shaderMaterial } from "@react-three/drei";
import { extend, type ThreeElement } from "@react-three/fiber";
import { Color, type ShaderMaterial, type Texture } from "three";
import { colorHex } from "@/lib/tokens";

// One GPU displacement surface. The vertex shader lifts a flat plane by a
// precomputed terrain height; uProgress (the master pass, 0 = before,
// 1 = after) controls how much the surface resolves: BEFORE is low, loose and
// dim grey, AFTER is tall, tight and cyan. Pure scroll/pointer/time driven.
// There is no audio amplitude here and no spectrum bars, only a static baked
// height field sampled per vertex. See terrainData.ts for the placeholder.

const vertex = /* glsl */ `
  uniform sampler2D uTerrain;
  uniform float uProgress;
  uniform float uTime;
  uniform vec2 uPointer;
  varying float vHeight;
  varying vec2 vUv;

  void main() {
    vUv = uv;
    float h = texture2D(uTerrain, uv).r;
    // BEFORE: compressed and noisy. AFTER: full height and crisp.
    float amount = mix(0.45, 1.0, uProgress);
    // A slow breathing drift, scaled down hard in the before state so the raw
    // mix reads unsettled but never busy.
    float drift = sin(uv.x * 12.0 + uTime * 0.4) * 0.04 * (1.0 - uProgress);
    // Pointer nudges the nearest ridge, a quiet parallax, never a burst.
    float reach = 1.0 - smoothstep(0.0, 0.5, distance(uv, uPointer * 0.5 + 0.5));
    float lift = (h + drift) * amount + reach * 0.06;
    vHeight = lift;
    vec3 pos = position;
    pos.z += lift;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

const fragment = /* glsl */ `
  uniform vec3 uColor;
  uniform float uProgress;
  varying float vHeight;
  varying vec2 vUv;

  void main() {
    // Contour lines off the height: the surface reads as line work, not a
    // filled blob. Lines tighten as the master resolves.
    float density = mix(8.0, 22.0, uProgress);
    float line = abs(fract(vHeight * density) - 0.5) * 2.0;
    // Wider line core plus a soft halo so the contours carry real luminance on
    // the near-black background instead of dissolving to invisibility.
    float ink = 1.0 - smoothstep(0.0, 0.22, line);
    float halo = (1.0 - smoothstep(0.0, 0.6, line)) * 0.35;
    float mark = clamp(ink + halo, 0.0, 1.0);
    // BEFORE leans a bright readable grey, AFTER leans full cyan.
    vec3 grey = vec3(0.52, 0.58, 0.62);
    vec3 tint = mix(grey, uColor, uProgress);
    // Fade the far edge so the plane dissolves into the near-black bg.
    float depth = smoothstep(0.0, 0.3, vUv.y);
    // High floor so the terrain is clearly visible at progress 0, climbing to
    // near-opaque cyan at progress 1.
    float alpha = mark * mix(0.7, 1.0, uProgress) * depth;
    gl_FragColor = vec4(tint, alpha);
  }
`;

const MotifShaderMaterial = shaderMaterial(
  {
    uTerrain: null as Texture | null,
    uProgress: 0,
    uTime: 0,
    uPointer: [0, 0],
    uColor: new Color(colorHex.cyan),
  },
  vertex,
  fragment,
);

extend({ MotifShaderMaterial });

declare module "@react-three/fiber" {
  interface ThreeElements {
    motifShaderMaterial: ThreeElement<typeof MotifShaderMaterial>;
  }
}

export type MotifMaterialProps = {
  terrain: Texture | null;
};

// Thin typed wrapper. Only the static uTerrain/uColor uniforms are set as React
// props; the per-frame uProgress/uTime/uPointer are written imperatively
// through the forwarded ref inside useFrame, so scroll never re-renders React.
export const MotifMaterial = forwardRef<ShaderMaterial, MotifMaterialProps>(
  function MotifMaterial({ terrain }, ref) {
    const color = new Color(colorHex.cyan);
    return (
      <motifShaderMaterial
        ref={ref}
        key={MotifShaderMaterial.key}
        uTerrain={terrain}
        uColor={color}
        transparent
        depthWrite={false}
      />
    );
  },
);
