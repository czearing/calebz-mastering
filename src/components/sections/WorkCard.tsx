"use client";

import { useRef, useState } from "react";
import { AlbumCard, TrackModal } from "@/components/work";
import type { Track } from "@/content";

export type WorkCardProps = {
  track: Track;
};

// A single Work card with its own before/after modal, for reading one track in
// isolation (stories, embeds). The grid (WorkGrid) is the real surface; this
// wrapper keeps one card self-contained (plan/24, plan/26).
export function WorkCard({ track }: WorkCardProps) {
  const [open, setOpen] = useState(false);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  return (
    <div
      ref={(el) => {
        triggerRef.current = el?.querySelector("button") ?? null;
      }}
    >
      <AlbumCard
        track={track}
        onOpen={() => {
          setRect(triggerRef.current?.getBoundingClientRect() ?? null);
          setOpen(true);
        }}
      />
      <TrackModal
        track={track}
        open={open}
        triggerRect={rect}
        onClose={() => {
          setOpen(false);
          requestAnimationFrame(() => triggerRef.current?.focus());
        }}
      />
    </div>
  );
}
