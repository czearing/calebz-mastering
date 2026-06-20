// Grouped review model for the checkout Review step. Pure: it reads prices only
// through the catalog (pricePerTrackCents, ADDONS), so the review can never
// disagree with the console or the server re-price. Instead of N identical
// rows, the review shows one tracks header line plus one aggregated line per
// add-on. See plan/30 B.

import { ADDONS, pricePerTrackCents } from "./catalog";
import type { AddonId, Cart } from "./types";

// The tier word a track count reads as, matching the catalog thresholds.
export function tierLabel(trackCount: number): string {
  if (trackCount <= 0) return "Empty";
  if (trackCount <= 2) return "Single";
  if (trackCount <= 5) return "EP";
  return "Album";
}

// One aggregated add-on row: the menu label, how many instances across the
// order, and the summed amount in cents. Per-track add-ons count once per
// track; per-item add-ons count by their chosen quantity.
export interface ReviewAddon {
  id: AddonId;
  label: string;
  qty: number;
  amountCents: number;
  quoteOnly: boolean;
}

// The grouped review of a cart: the base tracks line and the add-on lines.
export interface ReviewSummary {
  // "Album" / "EP" / "Single".
  tier: string;
  trackCount: number;
  perTrackCents: number;
  // Sum of the base per-track charges (no add-ons).
  tracksSubtotalCents: number;
  addons: ReviewAddon[];
}

// Build the grouped review. The base subtotal is perTrack x count. Each add-on
// is aggregated across every track: per-track add-ons add priceCents per track
// they are on; per-item add-ons add priceCents per chosen unit.
export function reviewSummary(cart: Cart): ReviewSummary {
  const trackCount = cart.tracks.length;
  const perTrackCents = pricePerTrackCents(trackCount);

  const addons: ReviewAddon[] = [];
  for (const addon of ADDONS) {
    let qty = 0;
    for (const track of cart.tracks) {
      const raw = track.addons[addon.id];
      const n = typeof raw === "number" ? Math.max(0, Math.trunc(raw)) : 0;
      if (n <= 0) continue;
      qty += addon.per === "track" ? 1 : n;
    }
    if (qty <= 0) continue;
    addons.push({
      id: addon.id,
      label: addon.label,
      qty,
      amountCents: addon.quoteOnly ? 0 : addon.priceCents * qty,
      quoteOnly: addon.quoteOnly === true,
    });
  }

  return {
    tier: tierLabel(trackCount),
    trackCount,
    perTrackCents,
    tracksSubtotalCents: perTrackCents * trackCount,
    addons,
  };
}
