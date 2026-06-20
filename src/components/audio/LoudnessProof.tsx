"use client";

import { cn } from "@/lib/cn";
import { Waveform } from "./Waveform";
import type { Loudness } from "./types";

export type LoudnessProofProps = {
  beforePeaks: number[];
  afterPeaks: number[];
  beforeLoudness?: Loudness;
  afterLoudness?: Loudness;
  className?: string;
};

// The non-audio proof (plan/13, WCAG 1.2.1). With sound off a visitor still
// reaches the conclusion: the raw mix reads quiet and peaky, the master full
// and controlled. Static waveforms plus the plain LUFS and true-peak numbers
// carry the difference visually. Numbers come from props, never measured live.
function Readout({
  label,
  peaks,
  loudness,
}: {
  label: string;
  peaks: number[];
  loudness?: Loudness;
}) {
  return (
    <div className="flex-1">
      <p className="mb-2 text-label font-mono uppercase tracking-[0.06em] text-muted">
        {label}
      </p>
      <div className="h-12 w-full">
        <Waveform peaks={peaks} />
      </div>
      {loudness && (
        <dl className="mt-2 grid grid-cols-2 gap-x-4 font-mono text-label tabular-nums">
          <dt className="text-muted">LUFS</dt>
          <dd className="text-right text-text">{loudness.lufs.toFixed(1)}</dd>
          <dt className="text-muted">True peak</dt>
          <dd className="text-right text-text">
            {loudness.truePeak.toFixed(1)} dBTP
          </dd>
        </dl>
      )}
    </div>
  );
}

export function LoudnessProof({
  beforePeaks,
  afterPeaks,
  beforeLoudness,
  afterLoudness,
  className,
}: LoudnessProofProps) {
  return (
    <div
      className={cn("flex flex-col gap-6 sm:flex-row sm:gap-8", className)}
      aria-label="Loudness comparison, before and after"
    >
      <Readout label="Before" peaks={beforePeaks} loudness={beforeLoudness} />
      <Readout label="After" peaks={afterPeaks} loudness={afterLoudness} />
    </div>
  );
}
