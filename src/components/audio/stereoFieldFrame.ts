import type { StereoRead } from "@/lib/audioReactive";

// Shared goniometer frame drawer, used by both the full-page field and the
// contained field inside the Work before/after modal, so the stereo-width
// visual is identical wherever a track plays. The horizontal openness is the
// smoothed stereo width: a narrow mix pulls to a tight bright bar, a wide
// master blooms open across the box. The vertical (mono) axis is compressed so
// correlated audio reads as a widening band, not a tall central column.

export type FieldState = { energy: number; widthSm: number };

export function newFieldState(): FieldState {
  return { energy: 0, widthSm: 0 };
}

// Draw one frame into ctx scaled to w by h. Fades the prior frame for a soft
// trail, reads live L vs R, and plots the bloom. Mutates state. Returns true
// when audio was read this frame (so the caller can publish energy/width).
export function drawStereoFrame(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  l: Float32Array,
  r: Float32Array,
  read: StereoRead | null,
  state: FieldState,
): boolean {
  const cx = w / 2;
  const cy = h / 2;
  ctx.globalCompositeOperation = "source-over";
  ctx.fillStyle = "rgba(6, 7, 8, 0.10)";
  ctx.fillRect(0, 0, w, h);
  if (!read || !read(l, r)) return false;

  let midSum = 0;
  let sideSum = 0;
  for (let i = 0; i < l.length; i += 2) {
    const mid = (l[i] + r[i]) * 0.5;
    const side = (l[i] - r[i]) * 0.5;
    midSum += mid * mid;
    sideSum += side * side;
  }
  const n = l.length / 2;
  const midRms = Math.sqrt(midSum / n);
  const sideRms = Math.sqrt(sideSum / n);
  state.energy = state.energy * 0.85 + Math.min(1, midRms * 2.6) * 0.15;
  const width = Math.min(1.4, sideRms / (midRms + 1e-4));
  state.widthSm = state.widthSm * 0.92 + width * 0.08;

  // Scale the horizontal (side) axis by the box WIDTH and the vertical (mono)
  // axis by the box HEIGHT, so the band fills any aspect, wide-short modal or
  // full page alike, instead of being capped by the shorter side. The width
  // multiplier is sensitive so even a modest master still opens visibly.
  const xRadius = w * 0.46;
  const yRadius = h * 0.42;
  const xScale = 1.1 + state.widthSm * 4.6;
  const core = Math.max(1.6, w * 0.0018);
  const glow = core * 4;
  const coreAlpha = 0.55 + Math.min(0.4, state.widthSm * 0.9);
  ctx.globalCompositeOperation = "lighter";
  for (let i = 0; i < l.length; i += 2) {
    const x = ((l[i] - r[i]) / Math.SQRT2) * xRadius * xScale;
    const y = ((l[i] + r[i]) / Math.SQRT2) * yRadius * 0.32;
    ctx.fillStyle = "rgba(0, 229, 255, 0.12)";
    ctx.fillRect(cx + x - glow / 2, cy - y - glow / 2, glow, glow);
    ctx.fillStyle = `rgba(120, 245, 255, ${coreAlpha.toFixed(3)})`;
    ctx.fillRect(cx + x, cy - y, core, core);
  }
  return true;
}
