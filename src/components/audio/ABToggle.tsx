"use client";

import { cn } from "@/lib/cn";
import type { ABSide } from "./useABAudio";

export type ABToggleProps = {
  side: ABSide;
  onChange: (side: ABSide) => void;
  className?: string;
};

const sides: { value: ABSide; label: string }[] = [
  { value: "before", label: "Before" },
  { value: "after", label: "After" },
];

// The signature toggle (plan/23): BEFORE and AFTER in mono, precise easing,
// a tactile state change. A radiogroup so it is keyboard operable and
// screen-reader clear. Motion is a token transition, gated by the global
// prefers-reduced-motion rule in globals.css.
export function ABToggle({ side, onChange, className }: ABToggleProps) {
  return (
    <div
      role="radiogroup"
      aria-label="Compare before and after master"
      className={cn(
        "inline-flex rounded-[var(--radius-sm)] border border-line p-1",
        className,
      )}
    >
      {sides.map(({ value, label }) => {
        const active = side === value;
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(value)}
            className={cn(
              "min-h-11 rounded-[var(--radius-sm)] px-4 font-mono text-label",
              "uppercase tracking-[0.12em] transition-colors duration-200",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan",
              active
                ? "bg-cyan text-bg"
                : "text-muted hover:text-text",
            )}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
