"use client";

import { useRef, useState } from "react";
import { track as trackEvent } from "@vercel/analytics";
import { cn } from "@/lib/cn";
import type { Track } from "@/content";
import { AlbumCard } from "./AlbumCard";
import { TrackModal } from "./TrackModal";

export type WorkGridProps = {
  tracks: Track[];
  className?: string;
};

// Editorial gallery with one lead track and a smaller supporting grid.
export function WorkGrid({ tracks, className }: WorkGridProps) {
  const [openId, setOpenId] = useState<string | null>(null);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const [genre, setGenre] = useState("all");
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const genres = [...new Set(tracks.flatMap((track) => track.genres))];
  const shown =
    genre === "all"
      ? tracks
      : tracks.filter((track) => track.genres.includes(genre));
  const featureFirst = genre === "all";

  const open = (id: string, el: HTMLButtonElement) => {
    trackEvent("Track Open", { track: id });
    triggerRef.current = el;
    setRect(el.getBoundingClientRect());
    setOpenId(id);
  };

  const close = () => {
    const trigger = triggerRef.current;
    setOpenId(null);
    requestAnimationFrame(() => trigger?.focus());
  };

  const openTrack = tracks.find((t) => t.id === openId) ?? null;

  return (
    <>
      {genres.length > 1 ? (
        <div className="mb-[var(--space-6)] flex justify-end">
          <label className="flex w-full items-center justify-between gap-3 border-b border-line pb-2 font-mono text-label uppercase tracking-[0.06em] text-muted sm:w-auto sm:min-w-[15rem]">
            <span>Genre</span>
            <select
              value={genre}
              onChange={(event) => {
                const next = event.target.value;
                trackEvent("Genre Filter", { genre: next });
                setGenre(next);
              }}
              className="cursor-pointer bg-transparent text-right text-text outline-none"
            >
              <option value="all">All genres</option>
              {genres.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
        </div>
      ) : null}
      <ul
        className={cn(
          "grid list-none grid-cols-2 gap-x-3 gap-y-6 p-0 sm:grid-cols-3 sm:gap-5 lg:grid-cols-6",
          className,
        )}
      >
        {shown.map((track, index) => (
          <li
            key={track.id}
            className={cn(
              featureFirst && index === 0
                ? "col-span-2 sm:col-span-3 lg:col-span-6"
                : "lg:col-span-2",
              featureFirst && index === 4 && "lg:col-start-2",
            )}
          >
            <CardItem
              track={track}
              featured={featureFirst && index === 0}
              onOpen={open}
            />
          </li>
        ))}
      </ul>
      {openTrack ? (
        <TrackModal track={openTrack} open triggerRect={rect} onClose={close} />
      ) : null}
    </>
  );
}

// Captures the card's own button element so the grid can grow the modal from it
// and return focus to it.
function CardItem({
  track,
  featured,
  onOpen,
}: {
  track: Track;
  featured: boolean;
  onOpen: (id: string, el: HTMLButtonElement) => void;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  return (
    <div ref={ref}>
      <AlbumCard
        track={track}
        featured={featured}
        onOpen={() => {
          const btn = ref.current?.querySelector("button");
          if (btn) onOpen(track.id, btn);
        }}
      />
    </div>
  );
}
