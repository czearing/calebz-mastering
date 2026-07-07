"use client";

import Image from "next/image";
import { cn } from "@/lib/cn";
import type { Track } from "@/content";
import { useTilt } from "./useTilt";

export type AlbumCardProps = {
  track: Track;
  onOpen: () => void;
};

// A real <button> showing just the album cover, like a record sleeve. The art
// carries the title; the metadata lives in the modal you open (plan/24). At rest
// the cover is desaturated grey; on hover or keyboard focus it lifts into a
// subtle 3D tilt and resolves to full color, and it stays colored for the whole
// hover (the color follows hover state, not cursor position). Tilt is imperative
// so there is no re-render or jitter per move; disabled on touch and reduced
// motion. Click, Enter, or Space opens the modal.
export function AlbumCard({ track, onOpen }: AlbumCardProps) {
  const tiltRef = useTilt();

  return (
    <button
      ref={tiltRef}
      type="button"
      onClick={onOpen}
      aria-label={`Open before and after for ${track.title} by ${track.artist}`}
      className={cn(
        "group relative block aspect-square w-full overflow-hidden rounded-[var(--radius-md)]",
        "border border-line bg-surface [transform-style:preserve-3d] [will-change:transform]",
        "hover:border-cyan focus-visible:border-cyan",
      )}
      // The card lights up with the music: a cyan glow scaled by the live audio
      // energy the page field publishes (plan/28). Zero when nothing plays.
      style={{
        boxShadow:
          "0 0 calc(var(--audio-energy, 0) * 16px) color-mix(in srgb, var(--cyan) 22%, transparent)",
      }}
    >
      <Image
        src={track.cover}
        alt=""
        fill
        loading="lazy"
        sizes="(max-width: 640px) 90vw, 320px"
        className={cn(
          "object-cover grayscale transition-[filter] duration-300 ease-out",
          "group-hover:grayscale-0 group-focus-visible:grayscale-0",
        )}
      />
    </button>
  );
}
