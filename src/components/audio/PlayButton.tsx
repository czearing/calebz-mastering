"use client";

import { cn } from "@/lib/cn";

export type PlayButtonProps = {
  playing: boolean;
  onClick: () => void;
  // Visible invite for the first play (plan/13 iOS gesture unlock).
  label?: string;
  className?: string;
};

// 44x44 primary transport control (plan/13 tap target). A single glyph
// swaps between play and pause; the accessible name swaps with it so a
// screen reader always announces the action, not the state.
export function PlayButton({
  playing,
  onClick,
  label,
  className,
}: PlayButtonProps) {
  const name = playing ? "Pause" : (label ?? "Play");
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={name}
      aria-pressed={playing}
      className={cn(
        "inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full",
        "bg-cyan text-bg transition-colors hover:bg-cyan-dim hover:text-text",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan",
        className,
      )}
    >
      <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
        {playing ? (
          <path d="M3 2h3v12H3zM10 2h3v12h-3z" fill="currentColor" />
        ) : (
          <path d="M4 2l10 6-10 6z" fill="currentColor" />
        )}
      </svg>
    </button>
  );
}
