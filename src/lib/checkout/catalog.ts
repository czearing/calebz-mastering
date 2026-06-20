// Catalog and pure pricing functions. All money in integer cents.
// Single source of truth for client live pricing and server re-price.
// See plan/29-services-checkout.md for the exact prices.

import type { Addon, AddonId, Cart, LineItem } from "./types";

// Per-track base price by total track count.
// 1 to 2 tracks = $65, 3 to 5 = $58, 6+ = $50.
// The tier is chosen from the whole cart's track count, then every
// track is billed at that single per-track price. Crossing a tier
// re-prices all tracks, not just the one that crossed it (honest math,
// the cheaper album rate applies to the entire release at 6+).
export function pricePerTrackCents(trackCount: number): number {
  if (trackCount <= 0) return 0;
  if (trackCount <= 2) return 6500;
  if (trackCount <= 5) return 5800;
  return 5000;
}

// The add-on menu for the UI. Cap the visible list and gate Atmos.
export const ADDONS: Addon[] = [
  { id: "stems", label: "Stem mastering", priceCents: 4000, per: "track" },
  { id: "rush", label: "Rush, 24 to 48h", priceCents: 3000, per: "track" },
  {
    id: "altVersion",
    label: "Alternate version (instrumental, clean, radio)",
    priceCents: 1500,
    per: "item",
  },
  {
    id: "extraFormat",
    label: "Extra format (Apple Digital Master, vinyl-ready)",
    priceCents: 2000,
    per: "item",
  },
  {
    id: "extraRevision",
    label: "Extra revision round (beyond 2)",
    priceCents: 2500,
    per: "track",
  },
  {
    id: "atmos",
    label: "Dolby Atmos",
    priceCents: 15000,
    per: "track",
    quoteOnly: true,
  },
];

const ADDONS_BY_ID: Record<AddonId, Addon> = ADDONS.reduce(
  (acc, addon) => {
    acc[addon.id] = addon;
    return acc;
  },
  {} as Record<AddonId, Addon>,
);

// True when the per-track add-on is enabled. Quantities other than
// 0 still count as enabled; the price is one unit per track.
function isTrackAddonOn(qty: number | undefined): boolean {
  return typeof qty === "number" && qty > 0;
}

// One line per track at the per-track price, plus one line per add-on
// instance with its computed amount. Track lines come first, then the
// add-on lines for that track, so the cart reads top to bottom.
export function lineItems(cart: Cart): LineItem[] {
  const perTrack = pricePerTrackCents(cart.tracks.length);
  const items: LineItem[] = [];

  cart.tracks.forEach((track, i) => {
    // An unnamed track reads as its 1-based position ("Track 1"), not a
    // generic "Untitled track", so the review step never shows identical rows.
    const title = track.title.trim() || `Track ${i + 1}`;
    items.push({
      label: title,
      amountCents: perTrack,
      kind: "track",
    });

    for (const addon of ADDONS) {
      const qty = track.addons[addon.id];
      if (addon.per === "track") {
        if (!isTrackAddonOn(qty)) continue;
        items.push({
          label: `${addon.label} - ${title}`,
          amountCents: addon.priceCents,
          kind: "addon",
        });
      } else {
        const count = typeof qty === "number" ? Math.max(0, Math.trunc(qty)) : 0;
        if (count <= 0) continue;
        items.push({
          label: `${addon.label} x${count} - ${title}`,
          amountCents: addon.priceCents * count,
          kind: "addon",
        });
      }
    }
  });

  return items;
}

// Sum of every line item. This is what the server recomputes from its
// own catalog. Never trust a client-supplied total.
export function cartTotalCents(cart: Cart): number {
  return lineItems(cart).reduce((sum, item) => sum + item.amountCents, 0);
}

// True if any track in the cart has the given add-on enabled. Used by the
// upload step to switch its guidance: a stem order needs grouped files per
// track, a flat order needs one file per track.
export function cartHasAddon(cart: Cart, id: AddonId): boolean {
  for (const track of cart.tracks) {
    if (isTrackAddonOn(track.addons[id])) return true;
  }
  return false;
}

// True if any track has a quote-only add-on (Atmos) enabled. Such a
// cart is quote-gated rather than directly payable.
export function quoteOnly(cart: Cart): boolean {
  for (const track of cart.tracks) {
    for (const id of Object.keys(track.addons) as AddonId[]) {
      const addon = ADDONS_BY_ID[id];
      if (addon?.quoteOnly && isTrackAddonOn(track.addons[id])) {
        return true;
      }
    }
  }
  return false;
}

// Format integer cents as a US dollar string, e.g. 6500 to "$65.00".
export function formatUsd(cents: number): string {
  const sign = cents < 0 ? "-" : "";
  const abs = Math.abs(Math.trunc(cents));
  const dollars = Math.floor(abs / 100);
  const remainder = abs % 100;
  const padded = remainder < 10 ? `0${remainder}` : `${remainder}`;
  return `${sign}$${dollars}.${padded}`;
}
