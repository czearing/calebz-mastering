"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/cn";

export type TrackStepperProps = {
  count: number;
  onChange: (next: number) => void;
  min?: number;
  max?: number;
};

const HOLD_DELAY_MS = 360;
const HOLD_REPEAT_MS = 90;

const stepBtn =
  "inline-flex h-16 w-16 shrink-0 items-center justify-center " +
  "rounded-[var(--radius-md)] border border-line bg-surface " +
  "text-h2 font-mono leading-none text-text transition-colors " +
  "hover:border-cyan hover:text-cyan disabled:opacity-40 " +
  "disabled:hover:border-line disabled:hover:text-text";

// The primary control. A large tactile minus / count / plus stepper. Holding a
// button accelerates after a short delay (autorepeat), and the count is a real
// spinbutton for assistive tech. The displayed number drives the whole console;
// no price lives here. See the services redesign brief.
export function TrackStepper({
  count,
  onChange,
  min = 1,
  max = 30,
}: TrackStepperProps) {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countRef = useRef(count);
  countRef.current = count;

  useEffect(() => () => stop(), []);

  function clamp(n: number): number {
    return Math.min(max, Math.max(min, n));
  }

  function bump(delta: number) {
    onChange(clamp(countRef.current + delta));
  }

  function stop() {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
  }

  // Hold to accelerate: one immediate step, a pause, then steady repeats.
  function startHold(delta: number) {
    stop();
    bump(delta);
    timer.current = setTimeout(function repeat() {
      bump(delta);
      timer.current = setTimeout(repeat, HOLD_REPEAT_MS);
    }, HOLD_DELAY_MS);
  }

  return (
    <div className="flex flex-col gap-[var(--space-3)]">
      <div className="flex items-center gap-[var(--space-4)]">
        <button
          type="button"
          className={stepBtn}
          aria-label="Remove one track"
          disabled={count <= min}
          onPointerDown={() => startHold(-1)}
          onPointerUp={stop}
          onPointerLeave={stop}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              bump(-1);
            }
          }}
        >
          <span aria-hidden="true">-</span>
        </button>

        <output
          className={cn(
            "min-w-[3ch] text-center font-mono leading-none text-text",
            "text-display tabular-nums",
          )}
          aria-label={`${count} ${count === 1 ? "track" : "tracks"}`}
          role="spinbutton"
          aria-valuenow={count}
          aria-valuemin={min}
          aria-valuemax={max}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "ArrowUp" || e.key === "ArrowRight") {
              e.preventDefault();
              bump(1);
            } else if (e.key === "ArrowDown" || e.key === "ArrowLeft") {
              e.preventDefault();
              bump(-1);
            }
          }}
        >
          {count}
        </output>

        <button
          type="button"
          className={stepBtn}
          aria-label="Add one track"
          disabled={count >= max}
          onPointerDown={() => startHold(1)}
          onPointerUp={stop}
          onPointerLeave={stop}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              bump(1);
            }
          }}
        >
          <span aria-hidden="true">+</span>
        </button>
      </div>
      <p className="text-label font-mono uppercase tracking-[0.06em] text-muted">
        How many tracks?
      </p>
    </div>
  );
}
