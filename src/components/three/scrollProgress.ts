// Normalized scroll progress 0..1 over the whole document. SSR safe: returns 0
// on the server. This is a pure synchronous read so callers can sample it inside
// an existing loop (R3F useFrame) with no React state and no re-render per frame
// MotifSurface drives the scroll = playhead morph straight onto GPU uniforms.
export function readProgress(): number {
  if (typeof window === "undefined") return 0;
  const doc = document.documentElement;
  const max = doc.scrollHeight - window.innerHeight;
  if (max <= 0) return 0;
  return Math.min(1, Math.max(0, window.scrollY / max));
}
