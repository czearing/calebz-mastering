"use client";

import { cn } from "@/lib/cn";
import { formatUsd } from "@/lib/checkout";
import type { Tier } from "./tiers";
import { useOdometer } from "./useOdometer";

export type LiveTotalProps = {
  totalCents: number;
  tier: Tier;
  trackCount: number;
  breakdown: string;
  atmosRequested: boolean;
};

// The single largest object in the section. The total odometer-rolls to its new
// value (transform/opacity-free integer tween, instant under reduced motion),
// and breathes with --audio-energy via text-shadow clamped so contrast stays
// above WCAG AA on #060708 at every energy level. The aria-live region
// announces "{tier}, {dollars} dollars, {n} tracks" on every change. The tier
// word and breakdown line read straight from props, so the meaning never
// depends on motion.
export function LiveTotal({
  totalCents,
  tier,
  trackCount,
  breakdown,
  atmosRequested,
}: LiveTotalProps) {
  const rolled = useOdometer(totalCents);
  const dollars = Math.round(rolled / 100);
  const exactDollars = Math.round(totalCents / 100);
  const tracksWord = trackCount === 1 ? "track" : "tracks";

  return (
    <div className="flex flex-col gap-[var(--space-3)]">
      <div className="flex items-baseline gap-[var(--space-3)]">
        <span
          key={tier.id}
          className="text-h2 font-sans uppercase tracking-[0.02em] text-text [animation:tier-swap_240ms_cubic-bezier(0.2,0.8,0.2,1)]"
        >
          {tier.label}
        </span>
        <span className="text-label font-mono uppercase tracking-[0.06em] text-muted">
          {tier.range}
        </span>
      </div>

      <span
        className={cn(
          "font-mono tabular-nums leading-none text-text",
          "text-[clamp(64px,12vw,128px)]",
          "[text-shadow:0_0_calc(var(--audio-energy,0)*22px)_rgba(0,229,255,calc(0.25+var(--audio-energy,0)*0.45))]",
        )}
      >
        {formatUsd(dollars * 100).replace(".00", "")}
      </span>

      <p className="text-body text-muted" aria-hidden="true">
        {breakdown}
        {atmosRequested ? " · Atmos quoted separately" : ""}
      </p>

      {/* The single announced source of truth for assistive tech: the exact,
          final value and tier, never the mid-roll figure. */}
      <span className="sr-only" aria-live="polite" role="status">
        {`${tier.label}, ${exactDollars} dollars, ${trackCount} ${tracksWord}${atmosRequested ? ", Atmos quote requested" : ""}`}
      </span>
    </div>
  );
}
