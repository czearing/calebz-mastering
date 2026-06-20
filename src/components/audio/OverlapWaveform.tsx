"use client";

import { useMemo, useRef } from "react";
import { cn } from "@/lib/cn";

export type OverlapWaveformProps = {
  beforePeaks: number[];
  afterPeaks: number[];
  // 0..1 playhead position.
  progress: number;
  // The audible side is emphasized; the other is dimmed.
  active: "before" | "after";
  onSeek: (fraction: number) => void;
  label?: string;
  className?: string;
};

const W = 1000;
const H = 260;
const MID = H / 2;
const BARS = 140;

// Downsample a peak array to a fixed bar count by averaging buckets.
function toBars(peaks: number[]): number[] {
  if (peaks.length === 0) return new Array(BARS).fill(0);
  const out: number[] = [];
  const step = peaks.length / BARS;
  for (let i = 0; i < BARS; i++) {
    const start = Math.floor(i * step);
    const end = Math.max(start + 1, Math.floor((i + 1) * step));
    let sum = 0;
    for (let j = start; j < end; j++) sum += peaks[j] ?? 0;
    out.push(sum / (end - start));
  }
  return out;
}

// Mirrored bar path centered on the baseline, scaled by a shared max so the
// loudest peak across both sides fills the height (the waveform reads big and
// full) while the before/after difference is preserved (before is quieter, so
// its bars stay proportionally shorter).
function barPath(bars: number[], max: number): string {
  const bw = W / BARS;
  return bars
    .map((p, i) => {
      const h = Math.max(2, (p / max) * (MID - 6));
      const x = i * bw + bw / 2;
      return `M${x.toFixed(1)} ${(MID - h).toFixed(1)} V${(MID + h).toFixed(1)}`;
    })
    .join(" ");
}

// One overlapping before/after comparison, the way iZotope overlays two signals
// rather than separating them (plan/26). Before is grey, after is cyan, on one
// shared baseline so the difference reads at a glance. One playhead scrubs both;
// the audible side is full opacity with a soft glow, the other dimmed. Tall and
// full-bleed so it reads as the hero of the player.
export function OverlapWaveform({
  beforePeaks,
  afterPeaks,
  progress,
  active,
  onSeek,
  label = "Before and after comparison",
  className,
}: OverlapWaveformProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const { before, after } = useMemo(() => {
    const b = toBars(beforePeaks);
    const a = toBars(afterPeaks);
    const max = Math.max(0.0001, ...b, ...a);
    return { before: barPath(b, max), after: barPath(a, max) };
  }, [beforePeaks, afterPeaks]);

  const seekAt = (clientX: number) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    onSeek(Math.min(1, Math.max(0, (clientX - r.left) / r.width)));
  };

  const beforeOn = active === "before";

  return (
    <div
      ref={ref}
      role="slider"
      tabIndex={0}
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(progress * 100)}
      onPointerDown={(e) => {
        e.currentTarget.setPointerCapture(e.pointerId);
        seekAt(e.clientX);
      }}
      onPointerMove={(e) => {
        if (e.buttons === 1) seekAt(e.clientX);
      }}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") onSeek(Math.min(1, progress + 0.02));
        if (e.key === "ArrowLeft") onSeek(Math.max(0, progress - 0.02));
      }}
      className={cn(
        "relative w-full cursor-pointer touch-none select-none",
        className,
      )}
    >
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        className="h-44 w-full md:h-56"
        aria-hidden="true"
      >
        <path
          d={before}
          stroke="var(--text)"
          strokeWidth={beforeOn ? 5 : 4}
          fill="none"
          opacity={beforeOn ? 0.95 : 0.22}
          style={beforeOn ? { filter: "drop-shadow(0 0 6px rgba(244,246,247,0.3))" } : undefined}
        />
        <path
          d={after}
          stroke="var(--cyan)"
          strokeWidth={beforeOn ? 4 : 5}
          fill="none"
          opacity={beforeOn ? 0.28 : 0.98}
          style={!beforeOn ? { filter: "drop-shadow(0 0 8px rgba(0,229,255,0.55))" } : undefined}
        />
        <line
          x1={progress * W}
          x2={progress * W}
          y1={0}
          y2={H}
          stroke="var(--text)"
          strokeWidth={2}
        />
      </svg>
    </div>
  );
}
