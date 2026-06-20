"use client";

import { cn } from "@/lib/cn";
import { useScrollCue } from "./useScrollCue";

export type ScrollCueProps = {
  className?: string;
};

// Site easing and the 250ms out timing from the designer (plan/24 A).
const EASE = "cubic-bezier(0.16, 1, 0.3, 1)";

// The master playhead at rest (plan/24 A), not a bouncing chevron. A short
// vertical cyan line sits over a faint horizontal hairline: the playhead motif.
// At the top it is visible and the line drifts slowly along the hairline (a
// nudge, not a bounce), priming "scroll plays the master pass". On scroll it
// retires (fade plus a small downward travel, 250ms) and returns at the top.
// Decorative: aria-hidden, pointer-events-none, never focusable. Reduced motion
// is honored by the global guard, so the show/hide is instant and the nudge is
// frozen with no per-component branch needed.
export function ScrollCue({ className }: ScrollCueProps) {
  const visible = useScrollCue();

  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none flex items-center justify-center",
        className,
      )}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(var(--space-3))",
        transition: `opacity 250ms ${EASE}, transform 250ms ${EASE}`,
      }}
    >
      {/* The hairline: a faint horizontal track the playhead rides along. */}
      <span className="relative block h-px w-[var(--space-8)] bg-line">
        {/* The playhead: the short vertical cyan line. Centered on the hairline,
            it drifts horizontally (motion-safe) as the idle nudge. */}
        <span
          className={cn(
            "absolute left-1/2 top-1/2 block h-[var(--space-5)] w-px",
            "-translate-y-1/2 bg-cyan",
            "motion-safe:animate-[var(--animate-playhead-nudge)]",
          )}
        />
      </span>
    </div>
  );
}
