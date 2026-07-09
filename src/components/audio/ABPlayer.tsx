"use client";

import { useEffect, useRef } from "react";
import { track } from "@vercel/analytics";
import { cn } from "@/lib/cn";
import { publishAudio } from "@/lib/audioReactive";
import { useABAudio } from "./useABAudio";
import { PlayButton } from "./PlayButton";
import { ABToggle } from "./ABToggle";
import { OverlapWaveform } from "./OverlapWaveform";
import { RadialSpectrum } from "./RadialSpectrum";
import { formatTime } from "./format";
import type { AudioSource, Loudness } from "./types";

export type ABPlayerProps = {
  before: AudioSource;
  after: AudioSource;
  title?: string;
  playLabel?: string;
  className?: string;
  analyticsId?: string;
  // Move focus to the play button on mount, so the spacebar toggles playback
  // immediately. Used by the Work modal, where the dialog would otherwise focus
  // the Close button and a space press would dismiss the popup.
  autoFocusPlay?: boolean;
};

// Showcase level policy: the MASTER (after) always plays at its full loudness — it's the product,
// so it should sound exactly as loud as it does in a music player. The "before" only ever gets pulled
// DOWN (never boosted, so a hot raw upload can't clip), and only if it were somehow louder than the
// master. So the mastered side is naturally louder AND cleaner, never attenuated to the raw mix.
function computeGain(
  beforeLufs?: number,
  afterLufs?: number,
): { before: number; after: number } {
  if (beforeLufs == null || afterLufs == null) return { before: 1, after: 1 };
  return {
    before: Math.min(1, 10 ** ((afterLufs - beforeLufs) / 20)),
    after: 1,
  };
}

// One compact LUFS and true-peak readout, the sound-off proof inline.
function Numbers({
  label,
  loudness,
  dim,
}: {
  label: string;
  loudness?: Loudness;
  dim?: boolean;
}) {
  if (!loudness) return null;
  return (
    <p
      className={cn(
        "font-mono text-label tabular-nums",
        dim ? "text-muted" : "text-text",
      )}
    >
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
  analyticsId,
  autoFocusPlay = false,
}: ABPlayerProps) {
  const gain = computeGain(before.loudness?.lufs, after.loudness?.lufs);

  const {
    playing,
    currentTime,
    duration,
    side,
    toggle,
    seek,
    setSide,
    readStereo,
    readFrequency,
  } = useABAudio(before.src, after.src, gain);

  // Lift the live tap so the band visualizer (and any other subscriber) reacts
  // to whatever is playing (plan/28). The frequency reader drives the bands.
  useEffect(() => {
    publishAudio(readStereo, playing, readFrequency);
    return () => publishAudio(null, false);
  }, [playing, readStereo, readFrequency]);

  // Land focus on play when asked (the modal), so the spacebar plays/pauses
  // instead of dismissing the dialog via the Close button.
  const playRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (autoFocusPlay) playRef.current?.focus();
  }, [autoFocusPlay]);

  const progress = duration > 0 ? currentTime / duration : 0;
  const onToggle = () => {
    if (!playing) track("Track Play", { track: analyticsId ?? title });
    toggle();
  };
  const onSideChange = (next: "before" | "after") => {
    track("A/B Switch", { track: analyticsId ?? title, side: next });
    setSide(next);
  };

  return (
    <section
      aria-label={title}
      className={cn(
        "relative rounded-[var(--radius-md)] border border-line bg-surface",
        // While playing, lift the player above the page-dim scrim so it is
        // spotlit and the spectrum can radiate over the darkened page.
        playing && "z-[60]",
        className,
      )}
    >
      {/* While playing, the rest of the page dims behind the player. Pointer
          transparent so the page stays usable. */}
      <div
        aria-hidden="true"
        className={cn(
          "pointer-events-none fixed inset-0 bg-bg/85 transition-opacity duration-500 ease-out",
          playing ? "opacity-100" : "opacity-0",
        )}
      />

      {/* The music visual: a Monstercat-style spectrum radiating OUTWARD from the
          player into the dimmed page, only while playing. Behind the content and
          outside its box, so it never covers the controls. */}
      <RadialSpectrum playing={playing} />

      <div className="relative z-10 flex flex-col gap-[clamp(0.5rem,1.7dvh,1.25rem)] p-[clamp(0.7rem,2dvh,1.25rem)]">
        <header className="flex items-center justify-between gap-3">
          <PlayButton
            ref={playRef}
            playing={playing}
            onClick={onToggle}
            label={playLabel}
          />
          <ABToggle side={side} onChange={onSideChange} />
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
            <Numbers
              label="Before"
              loudness={before.loudness}
              dim={side !== "before"}
            />
            <Numbers
              label="After"
              loudness={after.loudness}
              dim={side !== "after"}
            />
          </div>
          <p className="font-mono text-label tabular-nums text-muted">
            <span className="text-text">{formatTime(currentTime)}</span>
            {" / "}
            {formatTime(duration)}
          </p>
        </footer>
      </div>
    </section>
  );
}
