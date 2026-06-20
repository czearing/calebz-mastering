"use client";

import { useRef, type KeyboardEvent, type PointerEvent } from "react";
import { cn } from "@/lib/cn";
import { Waveform } from "./Waveform";

export type ScrubberProps = {
  peaks: number[];
  // 0..1 playback progress.
  progress: number;
  // Called with a 0..1 position when the visitor scrubs.
  onSeek: (fraction: number) => void;
  label: string;
  className?: string;
};

// The waveform doubles as the transport scrubber: a labeled slider with a
// 0..100 value, operable by pointer and by keyboard (arrows, home, end).
// The Waveform itself is aria-hidden; this wrapper carries the semantics.
export function Scrubber({
  peaks,
  progress,
  onSeek,
  label,
  className,
}: ScrubberProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const pct = Math.round(Math.max(0, Math.min(1, progress)) * 100);

  const fromPointer = (e: PointerEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    onSeek(Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)));
  };

  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const map: Record<string, number> = {
      ArrowRight: progress + 0.02,
      ArrowUp: progress + 0.02,
      ArrowLeft: progress - 0.02,
      ArrowDown: progress - 0.02,
      Home: 0,
      End: 1,
    };
    if (e.key in map) {
      e.preventDefault();
      onSeek(Math.max(0, Math.min(1, map[e.key])));
    }
  };

  return (
    <div
      ref={ref}
      role="slider"
      tabIndex={0}
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={pct}
      aria-valuetext={`${pct} percent`}
      onPointerDown={fromPointer}
      onKeyDown={onKey}
      className={cn(
        "h-12 w-full cursor-pointer touch-none rounded-[var(--radius-sm)]",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan",
        className,
      )}
    >
      <Waveform peaks={peaks} progress={progress} />
    </div>
  );
}
