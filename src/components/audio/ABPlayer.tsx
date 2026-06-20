"use client";

import { useEffect, useMemo } from "react";
import { cn } from "@/lib/cn";
import { publishAudio } from "@/lib/audioReactive";
import { useABAudio } from "./useABAudio";
import { PlayButton } from "./PlayButton";
import { ABToggle } from "./ABToggle";
import { OverlapWaveform } from "./OverlapWaveform";
import { formatTime } from "./format";
import type { AudioSource, Loudness } from "./types";

export type ABPlayerProps = {
  before: AudioSource;
  after: AudioSource;
  title?: string;
  playLabel?: string;
  className?: string;
};

// One compact LUFS and true-peak readout, the sound-off proof inline.
function Numbers({ label, loudness, dim }: { label: string; loudness?: Loudness; dim?: boolean }) {
  if (!loudness) return null;
  return (
    <p className={cn("font-mono text-label tabular-nums", dim ? "text-muted" : "text-text")}>
      <span className="uppercase tracking-[0.06em] text-muted">{label} </span>
      {loudness.lufs.toFixed(1)} LUFS
      <span className="text-muted"> / {loudness.truePeak.toFixed(1)} dBTP</span>
    </p>
  );
}

// THE signature: one play head, two sources, an instant gapless switch at the
// same position so only the master differs (plan/23). The before and after are
// drawn as one overlapping waveform (plan/26), grey versus cyan, so the
// difference reads at a glance. Both sides are level matched, so the only
// audible change is the master, never volume. Never autoplays.
export function ABPlayer({
  before,
  after,
  title = "Hear the difference",
  playLabel = "Hear the difference",
  className,
}: ABPlayerProps) {
  const gain = useMemo(() => {
    const b = before.loudness?.lufs;
    const a = after.loudness?.lufs;
    if (b == null || a == null) return { before: 1, after: 1 };
    const ref = Math.min(b, a);
    return {
      before: Math.min(1, 10 ** ((ref - b) / 20)),
      after: Math.min(1, 10 ** ((ref - a) / 20)),
    };
  }, [before.loudness?.lufs, after.loudness?.lufs]);

  const { playing, currentTime, duration, side, toggle, seek, setSide, readStereo } =
    useABAudio(before.src, after.src, gain);

  // Lift the live tap to the page so the full-bleed background reacts (plan/28).
  useEffect(() => {
    publishAudio(readStereo, playing);
    return () => publishAudio(null, false);
  }, [playing, readStereo]);

  const progress = duration > 0 ? currentTime / duration : 0;

  return (
    <section
      aria-label={title}
      className={cn(
        "flex flex-col gap-5 rounded-[var(--radius-md)] border border-line bg-surface p-5",
        className,
      )}
    >
      <header className="flex items-center justify-between gap-3">
        <PlayButton playing={playing} onClick={toggle} label={playLabel} />
        <ABToggle side={side} onChange={setSide} />
      </header>

      <OverlapWaveform
        beforePeaks={before.peaks}
        afterPeaks={after.peaks}
        progress={progress}
        active={side}
        onSeek={(f) => seek(f * (duration || 0))}
      />

      <footer className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
        <div className="flex flex-col gap-1">
          <Numbers label="Before" loudness={before.loudness} dim={side !== "before"} />
          <Numbers label="After" loudness={after.loudness} dim={side !== "after"} />
        </div>
        <p className="font-mono text-label tabular-nums text-muted">
          <span className="text-text">{formatTime(currentTime)}</span>
          {" / "}
          {formatTime(duration)}
        </p>
      </footer>
    </section>
  );
}
