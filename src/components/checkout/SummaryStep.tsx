"use client";

import { Tag } from "@/components/ui";
import { cn } from "@/lib/cn";
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
import { burstConfetti } from "./confetti";
import { SummaryOrderCard } from "./SummaryOrderCard";
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
  // First-master-free mode: shows "Free" instead of the price and turns Pay into
  // a no-charge claim. Toggled here.
  free: boolean;
  onSetFree: (free: boolean) => void;
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
  free,
  onSetFree,
  onEditCart,
  onBack,
  onNext,
}: SummaryStepProps) {
  const cfg = cartToConsole(cart);

  const claimFree = (e: React.MouseEvent<HTMLButtonElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    burstConfetti({ x: r.left + r.width / 2, y: r.top + r.height / 2 });
    onSetFree(true);
  };

  const setTracks = (n: number) =>
    onEditCart(buildHydrationCart(n, cfg.addons));
  const setAddons = (a: ConsoleAddonState) =>
    onEditCart(buildHydrationCart(cfg.trackCount, a));

  return (
    <div className="flex flex-col gap-[var(--space-6)]">
      <StepHeader
        title="Review your order"
        hint="Adjust anything here, then continue. Nothing is charged yet."
      />

      <SummaryOrderCard summary={summary} />

      {/* Edit in place: the same controls as the builder, wired to the cart. In
          free mode the order is locked to one track with no add-ons, so the
          stepper caps at 1 (both buttons disabled) and the ledger is disabled. */}
      <div className="flex flex-col gap-[var(--space-5)] rounded-[var(--radius-md)] border border-line p-[var(--space-5)]">
        <h2 className="text-label font-mono uppercase tracking-[0.06em] text-muted">
          Change your order
        </h2>
        <TrackStepper
          count={cfg.trackCount}
          onChange={setTracks}
          max={free ? 1 : undefined}
        />
        <AddOnsLedger
          addons={cfg.addons}
          onChange={setAddons}
          disabled={free}
        />
        {free ? (
          <p className="text-label font-mono text-muted">
            Your free first master is one track, no add-ons. Undo it above to
            build a paid release.
          </p>
        ) : null}
      </div>

      <p className="text-body text-muted">
        Every master includes WAV and MP3, two revisions, and a private delivery
        link, with about a three day turnaround. You send your tracks on the
        next step, before any payment.
      </p>

      {hasStems ? (
        <p className="text-body text-muted">
          Stem mastering means I master each track from its grouped stems, not a
          single stereo bounce, for tighter control over the balance.
        </p>
      ) : null}

      {/* First master free: claiming it runs the SAME flow but reads "Free" and
          skips payment, with a celebratory burst. No modal, no jump away. */}
      {!free ? (
        <button
          type="button"
          onClick={claimFree}
          className="flex items-center justify-between gap-[var(--space-4)] rounded-[var(--radius-md)] border border-cyan/40 bg-cyan/[0.04] px-[var(--space-5)] py-[var(--space-4)] text-left transition-colors hover:border-cyan"
        >
          <span className="flex flex-col gap-[var(--space-1)]">
            <span className="text-body text-text">
              New here? Your first master is free.
            </span>
            <span className="text-label font-mono text-muted">
              Hear it back before you pay for anything.
            </span>
          </span>
          <span className="shrink-0 text-label font-mono uppercase tracking-[0.06em] text-cyan">
            Make it free
          </span>
        </button>
      ) : (
        <div className="flex items-center justify-between gap-[var(--space-4)] rounded-[var(--radius-md)] border border-cyan bg-cyan/[0.06] px-[var(--space-5)] py-[var(--space-4)]">
          <span className="flex flex-col gap-[var(--space-1)]">
            <span className="text-body text-text">
              🎉 First master, on the house.
            </span>
            <span className="text-label font-mono text-muted">
              No charge today. Send your track and hear it back.
            </span>
          </span>
          <button
            type="button"
            onClick={() => onSetFree(false)}
            className="shrink-0 text-label font-mono uppercase tracking-[0.06em] text-muted transition-colors hover:text-text"
          >
            Undo
          </button>
        </div>
      )}

      {isQuote && !free ? (
        <p className="text-body text-muted">
          Dolby Atmos is quote-only and is not in the total below. Continue to
          request a quote.
        </p>
      ) : null}

      <div className="sticky bottom-0 z-10 flex items-center justify-between gap-[var(--space-4)] border-t border-line bg-bg py-[var(--space-4)]">
        <Tag className="self-center text-text">Total</Tag>
        <span
          className={cn(
            "text-h2 font-mono tabular-nums",
            free ? "text-cyan" : "text-text",
          )}
          aria-live="polite"
        >
          {free ? "Free" : formatUsd(totalCents)}
        </span>
      </div>

      <StepNav onBack={onBack} onNext={onNext} nextLabel="Continue" />
    </div>
  );
}
