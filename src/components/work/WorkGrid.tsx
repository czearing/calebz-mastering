"use client";

import { useMemo, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import type { Track } from "@/content";
import { AlbumCard } from "./AlbumCard";
import { TrackModal } from "./TrackModal";
import { useGridFlip } from "./useGridFlip";

// One genre filter pill. Helps an artist see only the work close to their own
// sound (plan/24). A real toggle button with aria-pressed.
function GenrePill({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "inline-flex min-h-[var(--space-6)] items-center rounded-[var(--radius-sm)] border",
        "px-[var(--space-3)] text-label font-mono uppercase tracking-[0.06em] transition-colors",
        active
          ? "border-cyan text-cyan"
          : "border-line text-muted hover:border-muted hover:text-text",
      )}
    >
      {label}
    </button>
  );
}

export type WorkGridProps = {
  tracks: Track[];
  className?: string;
};

// Fluid responsive grid: auto-fit minmax capped so cards size themselves and
// reflow with no overflow (plan/24 B). Generous gaps so it breathes. Owns which
// track's modal is open, captures the clicked card so the modal grows out of it
// (plan/26), and returns focus to that card on close.
export function WorkGrid({ tracks, className }: WorkGridProps) {
  const [openId, setOpenId] = useState<string | null>(null);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const gridRef = useRef<HTMLUListElement | null>(null);
  useGridFlip(gridRef);

  const genres = useMemo(
    () => [...new Set(tracks.map((t) => t.genre))],
    [tracks],
  );
  // Multi-select: pick any combination of genres (Dance and Pop together, say).
  // An empty set means "All". Toggling a pill adds or removes that genre.
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const shown =
    selected.size === 0 ? tracks : tracks.filter((t) => selected.has(t.genre));

  const toggleGenre = (g: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(g)) next.delete(g);
      else next.add(g);
      return next;
    });

  const open = (id: string, el: HTMLButtonElement) => {
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
        <div
          role="group"
          aria-label="Filter selected work by genre"
          className="mb-[var(--space-7)] flex flex-wrap gap-[var(--space-2)]"
        >
          <GenrePill
            label="All"
            active={selected.size === 0}
            onClick={() => setSelected(new Set())}
          />
          {genres.map((g) => (
            <GenrePill
              key={g}
              label={g}
              active={selected.has(g)}
              onClick={() => toggleGenre(g)}
            />
          ))}
        </div>
      ) : null}
      <ul
        ref={gridRef}
        className={cn(
          "grid list-none gap-[var(--space-6)] p-0",
          // auto-fill (not auto-fit) keeps cards a constant size: a lone card
          // sits at one track width instead of stretching to fill the row.
          "grid-cols-[repeat(auto-fill,minmax(min(100%,260px),1fr))]",
          // Reserve roughly two card rows on larger screens so filtering down
          // to a single row does not collapse the section and jump the page.
          "md:min-h-[36rem]",
          className,
        )}
      >
        {shown.map((track) => (
          <li key={track.id}>
            <CardItem track={track} onOpen={open} />
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
  onOpen,
}: {
  track: Track;
  onOpen: (id: string, el: HTMLButtonElement) => void;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  return (
    <div ref={ref}>
      <AlbumCard
        track={track}
        onOpen={() => {
          const btn = ref.current?.querySelector("button");
          if (btn) onOpen(track.id, btn);
        }}
      />
    </div>
  );
}
