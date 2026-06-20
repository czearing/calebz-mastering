// Public surface of the WebGL motif module. The page should dynamic-import
// MotifCanvas after first paint, e.g.:
//   const MotifCanvas = dynamic(
//     () => import("@/components/three").then((m) => m.MotifCanvas),
//     { ssr: false, loading: () => <MotifFallback /> },
//   );
// Everything here is decorative and fully optional.
export { MotifCanvas, default } from "./MotifCanvas";
export { MotifFallback } from "./MotifFallback";
export { MotifMaterial } from "./MotifMaterial";
export { MotifSurface } from "./MotifSurface";
export { useScrollSignal } from "./useScrollSignal";
export type { ScrollSignal } from "./useScrollSignal";
export { hasWebGL, cappedDpr, prefersReducedMotion } from "./webgl";
export { generateTerrain } from "./terrainData";
