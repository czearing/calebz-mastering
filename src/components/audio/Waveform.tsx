"use client";

import { useId, useMemo } from "react";
import { cn } from "@/lib/cn";
import { colorHex } from "@/lib/tokens";

export type WaveformProps = {
  // Precomputed, normalised envelope (0..1). No live FFT (plan/05).
  peaks: number[];
  // Playback progress, 0..1. Drives the cyan playhead and the cyan fill.
  progress?: number;
  className?: string;
};

// One thin monochrome path mirrored top and bottom, a neon cyan playhead.
// Deliberately not a spectrum: no bars, no per-frame work. The shape is the
// track's amplitude, the cyan portion is how far the playhead has travelled.
const VIEW_W = 1000;
const VIEW_H = 80;
const MID = VIEW_H / 2;

function toPath(peaks: number[]): string {
  if (peaks.length === 0) return "";
  const step = VIEW_W / peaks.length;
  const top: string[] = [];
  const bottom: string[] = [];
  peaks.forEach((p, i) => {
    const x = i * step;
    const h = Math.max(0.5, p * (MID - 2));
    top.push(`${i === 0 ? "M" : "L"}${x.toFixed(1)} ${(MID - h).toFixed(1)}`);
    bottom.unshift(`L${x.toFixed(1)} ${(MID + h).toFixed(1)}`);
  });
  return `${top.join(" ")} ${bottom.join(" ")} Z`;
}

export function Waveform({ peaks, progress = 0, className }: WaveformProps) {
  const clipId = useId();
  const d = useMemo(() => toPath(peaks), [peaks]);
  const playX = Math.max(0, Math.min(1, progress)) * VIEW_W;

  return (
    <svg
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      preserveAspectRatio="none"
      role="img"
      aria-hidden="true"
      className={cn("h-full w-full", className)}
    >
      <defs>
        <clipPath id={clipId}>
          <rect x="0" y="0" width={playX} height={VIEW_H} />
        </clipPath>
      </defs>
      {/* Unplayed body: muted line color. */}
      <path d={d} fill={colorHex.line} />
      {/* Played body: cyan, revealed up to the playhead. */}
      <path d={d} fill={colorHex.cyan} clipPath={`url(#${clipId})`} />
      {/* The playhead itself. */}
      {progress > 0 && (
        <line
          x1={playX}
          y1="0"
          x2={playX}
          y2={VIEW_H}
          stroke={colorHex.cyan}
          strokeWidth="2"
        />
      )}
    </svg>
  );
}
