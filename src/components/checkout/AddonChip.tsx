"use client";

import { cn } from "@/lib/cn";
import { formatUsd, type Addon } from "@/lib/checkout";

export type AddonChipProps = {
  addon: Addon;
  // Current quantity for this add-on on this track. 0 means off.
  qty: number;
  onChange: (qty: number) => void;
};

const chip =
  "flex min-h-[44px] w-full items-center justify-between gap-[var(--space-3)] " +
  "rounded-[var(--radius-md)] border px-[var(--space-4)] py-[var(--space-3)] " +
  "text-left transition-colors";

const step =
  "inline-flex h-[44px] min-w-[44px] items-center justify-center " +
  "rounded-[var(--radius-sm)] border border-line text-text " +
  "hover:border-cyan hover:text-cyan disabled:opacity-50";

// One add-on as an accessible toggle. Track add-ons are an aria-pressed
// button; item add-ons (alternate version, extra format) expose a +/- stepper
// for a quantity. Atmos is quote-only and labelled as such. See plan/29.
export function AddonChip({ addon, qty, onChange }: AddonChipProps) {
  const on = qty > 0;
  const isItem = addon.per === "item";
  const priceLabel = `+${formatUsd(addon.priceCents)}${addon.per === "track" ? " per track" : " each"}`;

  const meta = (
    <span className="flex flex-col gap-[var(--space-1)]">
      <span className="text-body text-text">{addon.label}</span>
      <span className="text-label font-mono text-muted">
        {priceLabel}
        {addon.quoteOnly ? " - quote only" : ""}
      </span>
    </span>
  );

  if (isItem) {
    return (
      <div
        className={cn(chip, on ? "border-cyan bg-surface" : "border-line bg-surface")}
      >
        {meta}
        <span className="flex items-center gap-[var(--space-2)]">
          <button
            type="button"
            className={step}
            aria-label={`Remove one ${addon.label}`}
            disabled={qty <= 0}
            onClick={() => onChange(qty - 1)}
          >
            -
          </button>
          <span
            className="min-w-[2ch] text-center text-body font-mono text-text"
            aria-live="polite"
          >
            {qty}
          </span>
          <button
            type="button"
            className={step}
            aria-label={`Add one ${addon.label}`}
            onClick={() => onChange(qty + 1)}
          >
            +
          </button>
        </span>
      </div>
    );
  }

  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={() => onChange(on ? 0 : 1)}
      className={cn(
        chip,
        on
          ? "border-cyan bg-surface text-text"
          : "border-line bg-surface text-text hover:border-cyan-dim",
      )}
    >
      {meta}
      <span className="text-label font-mono text-cyan">{on ? "On" : "Off"}</span>
    </button>
  );
}
