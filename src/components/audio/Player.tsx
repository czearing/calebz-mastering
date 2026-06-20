"use client";

import { cn } from "@/lib/cn";
import { useAudio } from "./useAudio";
import { Scrubber } from "./Scrubber";
import { PlayButton } from "./PlayButton";
import { formatTime } from "./format";

export type PlayerProps = {
  src: string;
  // Precomputed envelope for the waveform (plan/05). Never live FFT.
  peaks: number[];
  title?: string;
  // Visible invite for the first play (plan/13).
  playLabel?: string;
  className?: string;
};

// Single-track player: one transport, time readout, and a scrubbable
// monochrome waveform. The audio engine is lazy (useAudio), so nothing
// streams until the first explicit tap on play.
export function Player({
  src,
  peaks,
  title,
  playLabel = "Play",
  className,
}: PlayerProps) {
  const { playing, currentTime, duration, toggle, seek } = useAudio(src);
  const progress = duration > 0 ? currentTime / duration : 0;

  return (
    <figure
      className={cn(
        "flex flex-col gap-3 rounded-[var(--radius-md)] border border-line bg-surface p-4",
        className,
      )}
    >
      {title && (
        <figcaption className="text-label font-mono uppercase tracking-[0.06em] text-muted">
          {title}
        </figcaption>
      )}
      <div className="flex items-center gap-4">
        <PlayButton playing={playing} onClick={toggle} label={playLabel} />
        <div className="flex-1">
          <Scrubber
            peaks={peaks}
            progress={progress}
            onSeek={(f) => seek(f * (duration || 0))}
            label={title ? `Seek ${title}` : "Seek"}
          />
        </div>
        <p className="w-20 shrink-0 text-right font-mono text-label tabular-nums text-muted">
          <span className="text-text">{formatTime(currentTime)}</span>
          {" / "}
          {formatTime(duration)}
        </p>
      </div>
    </figure>
  );
}
