"use client";

import { useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";

export type MarqueeProps = {
  children: ReactNode;
  className?: string;
  // Seconds for one full pass. Slow is the intent, see plan/05.
  duration?: number;
};

// Slow horizontal drift for testimonials. Pauses on hover and on focus within.
// Under reduced motion the track is static and fully readable (handled by the
// prefers-reduced-motion rule in globals.css). Pure CSS, no animation library.
export function Marquee({ children, className, duration = 40 }: MarqueeProps) {
  const [paused, setPaused] = useState(false);

  return (
    <div
      className={cn("relative w-full overflow-hidden", className)}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <div
        className={cn("flex w-max gap-[var(--space-8)] motion-safe:animate-marquee", paused && "[animation-play-state:paused]")}
        style={{ animationDuration: `${duration}s` }}
      >
        <div className="flex shrink-0 gap-[var(--space-8)]">{children}</div>
        <div aria-hidden className="flex shrink-0 gap-[var(--space-8)]">
          {children}
        </div>
      </div>
    </div>
  );
}
