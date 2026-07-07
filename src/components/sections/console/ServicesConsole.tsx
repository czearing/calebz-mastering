"use client";

import { useState } from "react";
import {
  EMPTY_ADDON_STATE,
  addonUnitCents,
  consoleTotalCents,
  formatUsd,
  pricePerTrackCents,
  toQueryString,
  type ConsoleAddonState,
} from "@/lib/checkout";
import { Reveal } from "@/components/ui";
import { TrackStepper } from "./TrackStepper";
import { TierRail } from "./TierRail";
import { AddOnsLedger } from "./AddOnsLedger";
import { LiveTotal } from "./LiveTotal";
import { CheckoutCTA } from "./CheckoutCTA";
import { tierForCount } from "./tiers";

export type ServicesConsoleProps = {
  startHref?: string;
};

// The live order builder. Owns the only two pieces of state, trackCount and the
// add-on config, and derives everything else (tier, total, breakdown, /start
// href) from the catalog through consoleTotalCents. No price is hardcoded here.
// Left column configures, right column is the sticky live readout on desktop and
// a pinned bottom bar on mobile, per the brief layout.
export function ServicesConsole({ startHref = "/start" }: ServicesConsoleProps) {
  const [trackCount, setTrackCount] = useState(1);
  const [addons, setAddons] = useState<ConsoleAddonState>(EMPTY_ADDON_STATE);

  const tier = tierForCount(trackCount);
  const totalCents = consoleTotalCents(trackCount, addons);
  const breakdown = buildBreakdown(trackCount, addons);
  const href = `${startHref}?${toQueryString(trackCount, addons)}`;

  const readout = (
    <LiveTotal
      totalCents={totalCents}
      tier={tier}
      trackCount={trackCount}
      breakdown={breakdown}
      atmosRequested={addons.atmos}
    />
  );

  return (
    <div className="relative">
      <div className="grid gap-[var(--space-7)] lg:grid-cols-[58fr_42fr] lg:gap-[var(--space-9)]">
        {/* LEFT: the inputs. */}
        <div className="flex flex-col gap-[var(--space-7)] lg:border-r lg:border-line lg:pr-[var(--space-9)]">
          <Reveal>
            <TrackStepper count={trackCount} onChange={setTrackCount} />
          </Reveal>
          <Reveal index={1}>
            <TierRail activeId={tier.id} onSnap={setTrackCount} />
          </Reveal>
          <Reveal index={2}>
            <AddOnsLedger addons={addons} onChange={setAddons} />
          </Reveal>
        </div>

        {/* RIGHT: sticky live readout on desktop; hidden on mobile (the pinned
            bottom bar carries it there so the number is always visible). */}
        <div className="hidden lg:block">
          <Reveal index={3}>
            <div className="sticky top-[var(--space-8)] flex flex-col gap-[var(--space-6)]">
              {readout}
              <ul className="flex flex-col gap-[var(--space-2)]">
                {INCLUDED.map((line) => (
                  <li
                    key={line}
                    className="flex items-center gap-[var(--space-2)] text-body text-muted"
                  >
                    <span aria-hidden="true" className="text-cyan">
                      {"+"}
                    </span>
                    {line}
                  </li>
                ))}
              </ul>
              <CheckoutCTA href={href} quote={addons.atmos} />
            </div>
          </Reveal>
        </div>
      </div>

      {/* MOBILE: pinned bottom bar, the right column collapsed. Always visible
          while configuring above it. */}
      <div className="sticky bottom-0 z-10 mt-[var(--space-7)] flex items-center justify-between gap-[var(--space-3)] border-t border-line bg-bg/95 py-[var(--space-3)] backdrop-blur lg:hidden">
        <div className="flex items-baseline gap-[var(--space-2)]">
          <span className="text-label font-mono uppercase tracking-[0.06em] text-muted">
            {tier.label}
          </span>
          <span className="text-h2 font-mono tabular-nums text-text [text-shadow:0_0_calc(var(--audio-energy,0)*16px)_rgba(0,229,255,calc(0.25+var(--audio-energy,0)*0.4))]">
            {formatUsd(totalCents).replace(".00", "")}
          </span>
        </div>
        <div className="max-w-[55%]">
          <CheckoutCTA href={href} quote={addons.atmos} label="Checkout" />
        </div>
      </div>
    </div>
  );
}

const INCLUDED = [
  "Two revisions included",
  "WAV plus MP3 delivery",
  "About a 3 day turnaround",
];

// The quiet secondary line under the total: the per-track math plus each active
// add-on's contribution, all read from the catalog. Atmos appears only as a
// note (handled in LiveTotal), never as a dollar amount.
function buildBreakdown(count: number, addons: ConsoleAddonState): string {
  const rate = pricePerTrackCents(count);
  const parts: string[] = [
    `${count} x ${formatUsd(rate).replace(".00", "")}/track`,
  ];

  const perTrack: [("stems" | "rush" | "extraRevision"), string][] = [
    ["stems", "stem"],
    ["rush", "rush"],
    ["extraRevision", "revision"],
  ];
  for (const [key, label] of perTrack) {
    if (addons[key]) {
      const amount = addonUnitCents(key) * count;
      parts.push(`${label} +${formatUsd(amount).replace(".00", "")}`);
    }
  }
  if (addons.altVersion > 0) {
    const amount = addonUnitCents("altVersion") * addons.altVersion;
    parts.push(`alt x${addons.altVersion} +${formatUsd(amount).replace(".00", "")}`);
  }
  if (addons.extraFormat > 0) {
    const amount = addonUnitCents("extraFormat") * addons.extraFormat;
    parts.push(`format x${addons.extraFormat} +${formatUsd(amount).replace(".00", "")}`);
  }

  return parts.join(" · ");
}
