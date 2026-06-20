"use client";

import { useState } from "react";
import { Tag } from "@/components/ui";
import {
  buildHydrationCart,
  cartToConsole,
  formatUsd,
  type Cart,
  type ConsoleAddonState,
  type ReviewSummary,
} from "@/lib/checkout";
import { TrackStepper } from "@/components/sections/console/TrackStepper";
import { AddOnsLedger } from "@/components/sections/console/AddOnsLedger";
import { FreeMasterDialog } from "./FreeMasterDialog";
import { StepHeader } from "./StepHeader";
import { StepNav } from "./StepNav";

export type SummaryStepProps = {
  summary: ReviewSummary;
  totalCents: number;
  isQuote: boolean;
  // The live cart, so the order can be edited in place (no page change).
  cart: Cart;
  // True when the order includes stem mastering, to explain the add-on once.
  hasStems?: boolean;
  index: number;
  count: number;
  // Replace the whole cart when the customer edits the order here.
  onEditCart: (cart: Cart) => void;
  onBack?: () => void;
  onNext: () => void;
};

// Step 1 of the seeded flow: Review, and edit in place. The order reads back
// grouped, then the same stepper and add-on controls the builder uses sit right
// here, so changing the track count or an add-on never leaves the checkout or
// loses the configuration (the old "Change your order" link did both). The total
// updates live. See plan/32.
export function SummaryStep({
  summary,
  totalCents,
  isQuote,
  cart,
  hasStems = false,
  index,
  count,
  onEditCart,
  onBack,
  onNext,
}: SummaryStepProps) {
  const tracksWord = summary.trackCount === 1 ? "track" : "tracks";
  const cfg = cartToConsole(cart);
  const [freeOpen, setFreeOpen] = useState(false);

  const setTracks = (n: number) => onEditCart(buildHydrationCart(n, cfg.addons));
  const setAddons = (a: ConsoleAddonState) =>
    onEditCart(buildHydrationCart(cfg.trackCount, a));

  return (
    <div className="flex flex-col gap-[var(--space-6)]">
      <StepHeader
        index={index}
        count={count}
        title="Review your order"
        hint="Adjust anything here, then continue. Nothing is charged yet."
      />

      <div className="flex flex-col rounded-[var(--radius-md)] border border-line bg-surface">
        <div className="flex items-baseline justify-between gap-[var(--space-4)] border-b border-line px-[var(--space-5)] py-[var(--space-4)]">
          <div className="flex flex-col gap-[var(--space-1)]">
            <span className="text-h2 font-sans text-text">{summary.tier}</span>
            <span className="text-label font-mono uppercase tracking-[0.06em] text-muted">
              {summary.trackCount} {tracksWord}, {formatUsd(summary.perTrackCents)}{" "}
              per track
            </span>
          </div>
          <span className="text-body font-mono tabular-nums text-text">
            {formatUsd(summary.tracksSubtotalCents)}
          </span>
        </div>

        {summary.addons.length > 0 ? (
          <ul className="flex flex-col divide-y divide-line">
            {summary.addons.map((addon) => (
              <li
                key={addon.id}
                className="flex items-center justify-between gap-[var(--space-4)] px-[var(--space-5)] py-[var(--space-3)]"
              >
                <span className="text-body text-muted">
                  {addon.label}
                  {addon.qty > 1 ? ` x${addon.qty}` : ""}
                </span>
                <span className="text-body font-mono tabular-nums text-text">
                  {addon.quoteOnly ? "Quoted" : formatUsd(addon.amountCents)}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="px-[var(--space-5)] py-[var(--space-3)] text-body text-muted">
            No add-ons. Just a clean master.
          </p>
        )}
      </div>

      {/* Edit in place: the same controls as the builder, wired to the cart. */}
      <div className="flex flex-col gap-[var(--space-5)] rounded-[var(--radius-md)] border border-line p-[var(--space-5)]">
        <h2 className="text-label font-mono uppercase tracking-[0.06em] text-muted">
          Change your order
        </h2>
        <TrackStepper count={cfg.trackCount} onChange={setTracks} />
        <AddOnsLedger addons={cfg.addons} onChange={setAddons} />
      </div>

      <p className="text-body text-muted">
        Every master includes WAV and MP3, two revisions, and a private delivery
        link, with about a three day turnaround. You send your tracks on the next
        step, before any payment.
      </p>

      {hasStems ? (
        <p className="text-body text-muted">
          Stem mastering means I master each track from its grouped stems, not a
          single stereo bounce, for tighter control over the balance.
        </p>
      ) : null}

      {/* The free first master as the low-commitment way in, surfaced before any
          commitment to paying. It opens a popup on this page (not a jump to the
          homepage contact section), so the customer never loses the flow. */}
      <p className="text-body text-text">
        New here? Your first master is free.{" "}
        <button
          type="button"
          onClick={() => setFreeOpen(true)}
          className="text-cyan underline-offset-4 hover:underline"
        >
          Try that first
        </button>
        .
      </p>
      <FreeMasterDialog open={freeOpen} onClose={() => setFreeOpen(false)} />

      {isQuote ? (
        <p className="text-body text-muted">
          Dolby Atmos is quote-only and is not in the total below. Continue to
          request a quote.
        </p>
      ) : null}

      <div className="sticky bottom-0 z-10 flex items-center justify-between gap-[var(--space-4)] border-t border-line bg-bg py-[var(--space-4)]">
        <Tag className="self-center text-text">Total</Tag>
        <span
          className="text-h2 font-mono tabular-nums text-text"
          aria-live="polite"
        >
          {formatUsd(totalCents)}
        </span>
      </div>

      <StepNav onBack={onBack} onNext={onNext} nextLabel="Continue" />
    </div>
  );
}
