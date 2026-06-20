"use client";

import { cn } from "@/lib/cn";
import { formatUsd } from "@/lib/checkout";
import { TIERS, type TierId } from "./tiers";

export type TierRailProps = {
  activeId: TierId;
  onSnap: (entry: number) => void;
};

const tile =
  "group relative flex flex-1 flex-col gap-[var(--space-1)] " +
  "rounded-[var(--radius-md)] border px-[var(--space-4)] py-[var(--space-3)] " +
  "text-left transition-[transform,border-color,box-shadow] duration-200 " +
  "hover:-translate-y-0.5";

// The three tiers as read-outs that respond to the stepper. The active tile
// (matching the current count) carries a cyan outline, an inner glow scaled by
// audio energy, aria-current, and a non-color "active" word so the state never
// depends on color alone. Clicking a tile snaps the stepper to that tier's
// entry count. The tiles do not price anything; they reflect the live count.
export function TierRail({ activeId, onSnap }: TierRailProps) {
  return (
    <ul className="flex flex-col gap-[var(--space-2)] sm:flex-row sm:gap-[var(--space-3)]">
      {TIERS.map((tier) => {
        const active = tier.id === activeId;
        return (
          <li key={tier.id} className="flex">
            <button
              type="button"
              aria-current={active ? "true" : undefined}
              aria-label={`${tier.label}, ${tier.range}, ${formatUsd(tier.rateCents)} per track${active ? ", active tier" : ""}`}
              onClick={() => onSnap(tier.entry)}
              className={cn(
                tile,
                active
                  ? "border-cyan bg-surface text-text [box-shadow:inset_0_0_calc(12px+var(--audio-energy,0)*18px)_rgba(0,229,255,calc(0.12+var(--audio-energy,0)*0.22))]"
                  : "border-line bg-surface text-muted hover:border-cyan-dim",
              )}
            >
              <span className="flex items-baseline justify-between gap-[var(--space-2)]">
                <span className="text-body font-sans uppercase tracking-[0.04em]">
                  {tier.label}
                </span>
                <span
                  className={cn(
                    "text-label font-mono",
                    active ? "text-cyan" : "text-muted",
                  )}
                >
                  {formatUsd(tier.rateCents)}
                  <span className="text-muted">/track</span>
                </span>
              </span>
              <span className="flex items-center justify-between gap-[var(--space-2)]">
                <span className="text-label font-mono uppercase tracking-[0.06em] text-muted">
                  {tier.range}
                </span>
                <span
                  className={cn(
                    "text-label font-mono uppercase tracking-[0.06em]",
                    active ? "text-cyan" : "text-transparent",
                  )}
                  aria-hidden="true"
                >
                  {active ? "active" : "set"}
                </span>
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
