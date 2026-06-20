// Tests for the grouped review model. Asserts the review never disagrees with
// the catalog total and groups instead of repeating identical rows. See plan/30.

import { describe, it, expect } from "vitest";
import { reviewSummary, tierLabel } from "./review";
import { cartTotalCents } from "./catalog";
import { emptyCart, addTrack, setAddon } from "./cart";
import type { Cart } from "./types";

function trackCart(n: number): Cart {
  let cart = emptyCart();
  for (let i = 0; i < n; i++) cart = addTrack(cart, "");
  return cart;
}

describe("tierLabel", () => {
  it("names the tier by the catalog thresholds", () => {
    expect(tierLabel(0)).toBe("Empty");
    expect(tierLabel(1)).toBe("Single");
    expect(tierLabel(3)).toBe("EP");
    expect(tierLabel(6)).toBe("Album");
  });
});

describe("reviewSummary", () => {
  it("groups six tracks into one Album header line at the album rate", () => {
    const summary = reviewSummary(trackCart(6));
    expect(summary.tier).toBe("Album");
    expect(summary.trackCount).toBe(6);
    expect(summary.perTrackCents).toBe(5000);
    expect(summary.tracksSubtotalCents).toBe(30000);
    expect(summary.addons).toHaveLength(0);
  });

  it("aggregates a per-track add-on into one line counted per track", () => {
    let cart = trackCart(3);
    for (const t of cart.tracks) cart = setAddon(cart, t.id, "stems", 1);
    const summary = reviewSummary(cart);
    expect(summary.addons).toHaveLength(1);
    const stems = summary.addons[0];
    expect(stems.id).toBe("stems");
    expect(stems.qty).toBe(3); // one per track
    expect(stems.amountCents).toBe(12000); // 3 x $40
  });

  it("aggregates a per-item add-on by its chosen quantity", () => {
    let cart = trackCart(1);
    cart = setAddon(cart, cart.tracks[0].id, "altVersion", 2);
    const summary = reviewSummary(cart);
    expect(summary.addons).toHaveLength(1);
    expect(summary.addons[0].qty).toBe(2);
    expect(summary.addons[0].amountCents).toBe(3000); // 2 x $15
  });

  it("keeps Atmos out of the priced amount but flags it quoteOnly", () => {
    let cart = trackCart(1);
    cart = setAddon(cart, cart.tracks[0].id, "atmos", 1);
    const atmos = reviewSummary(cart).addons.find((a) => a.id === "atmos");
    expect(atmos?.quoteOnly).toBe(true);
    expect(atmos?.amountCents).toBe(0);
  });

  it("never disagrees with the catalog total (base plus priced add-ons)", () => {
    let cart = trackCart(4);
    cart = setAddon(cart, cart.tracks[0].id, "stems", 1);
    cart = setAddon(cart, cart.tracks[1].id, "extraFormat", 2);
    const summary = reviewSummary(cart);
    const grouped =
      summary.tracksSubtotalCents +
      summary.addons.reduce((s, a) => s + a.amountCents, 0);
    expect(grouped).toBe(cartTotalCents(cart));
  });
});
