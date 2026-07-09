"use client";

import Image from "next/image";
import { cn } from "@/lib/cn";
import type { Track } from "@/content";
import { useTilt } from "./useTilt";

export type AlbumCardProps = {
  track: Track;
  onOpen: () => void;
  featured?: boolean;
};

// A real <button> showing just the album cover, like a record sleeve. The art
// carries the title; the metadata lives in the modal you open (plan/24). At rest
// the cover is desaturated grey; on hover or keyboard focus it lifts into a
// subtle 3D tilt and resolves to full color, and it stays colored for the whole
// hover (the color follows hover state, not cursor position). Tilt is imperative
// so there is no re-render or jitter per move; disabled on touch and reduced
// motion. Click, Enter, or Space opens the modal.
export function AlbumCard({ track, onOpen, featured = false }: AlbumCardProps) {
  const tiltRef = useTilt();

  return (
    <button
      ref={tiltRef}
      type="button"
      onClick={onOpen}
      aria-label={`Open before and after for ${track.title} by ${track.artist}`}
      className={cn(
        "group block w-full text-left [transform-style:preserve-3d] [will-change:transform]",
        featured &&
          "md:grid md:grid-cols-[minmax(0,1.4fr)_minmax(15rem,0.6fr)]",
      )}
    >
      <span
        className={cn(
          "relative block aspect-square w-full overflow-hidden rounded-[var(--radius-md)]",
          "border border-line bg-surface transition-colors",
          "group-hover:border-cyan group-focus-visible:border-cyan",
          featured && "md:aspect-[16/10] md:rounded-r-none md:border-r-0",
        )}
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
          sizes={
            featured
              ? "(max-width: 640px) 92vw, 50vw"
              : "(max-width: 640px) 46vw, 25vw"
          }
          className={cn(
            "object-cover grayscale transition-[filter,transform] duration-300 ease-out",
            "group-hover:scale-[1.02] group-hover:grayscale-0",
            "group-focus-visible:scale-[1.02] group-focus-visible:grayscale-0",
          )}
        />
      </span>

      <span
        className={cn(
          "mt-3 flex items-start justify-between gap-3",
          featured &&
            "flex-col md:mt-0 md:justify-end md:rounded-r-[var(--radius-md)] md:border md:border-l-0 md:border-line md:bg-surface md:p-6 md:transition-colors md:group-hover:border-cyan md:group-focus-visible:border-cyan",
        )}
      >
        <span className="min-w-0">
          <span
            className={cn(
              "block font-sans leading-tight text-text",
              featured ? "text-[clamp(1.25rem,3vw,2rem)]" : "text-body",
            )}
          >
            {track.title}
          </span>
          <span className="mt-1 block font-mono text-label uppercase tracking-[0.06em] text-muted">
            {track.artist}
          </span>
        </span>
        {featured ? (
          <span className="shrink-0 font-mono text-label uppercase text-muted">
            {track.genres.join(" / ")}
          </span>
        ) : null}
      </span>
    </button>
  );
}
