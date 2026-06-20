// Pricing tests. Asserts the exact numbers from plan/29-services-checkout.md.

import { describe, it, expect } from "vitest";
import {
  ADDONS,
  pricePerTrackCents,
  lineItems,
  cartTotalCents,
  cartHasAddon,
  quoteOnly,
  formatUsd,
} from "./catalog";
import { emptyCart, addTrack, setAddon } from "./cart";
import type { Cart } from "./types";

// Build a cart of n plain tracks with deterministic ids.
function trackCart(n: number): Cart {
  let cart = emptyCart();
  for (let i = 0; i < n; i++) {
    cart = addTrack(cart, `Track ${i + 1}`);
  }
  return cart;
}

describe("pricePerTrackCents tiers", () => {
  it("prices 1 to 2 tracks at $65", () => {
    expect(pricePerTrackCents(1)).toBe(6500);
    expect(pricePerTrackCents(2)).toBe(6500);
  });

  it("prices 3 to 5 tracks (EP) at $58", () => {
    expect(pricePerTrackCents(3)).toBe(5800);
    expect(pricePerTrackCents(5)).toBe(5800);
  });

  it("prices 6+ tracks (album) at $50", () => {
    expect(pricePerTrackCents(6)).toBe(5000);
    expect(pricePerTrackCents(10)).toBe(5000);
  });

  it("returns 0 for an empty cart", () => {
    expect(pricePerTrackCents(0)).toBe(0);
  });
});

describe("cartTotalCents headline prices", () => {
  it("1 track = $65.00", () => {
    expect(cartTotalCents(trackCart(1))).toBe(6500);
    expect(formatUsd(cartTotalCents(trackCart(1)))).toBe("$65.00");
  });

  it("4-track EP = $232.00", () => {
    // 4 tracks at $58 = $232.
    expect(cartTotalCents(trackCart(4))).toBe(23200);
    expect(formatUsd(cartTotalCents(trackCart(4)))).toBe("$232.00");
  });

  it("10-track album = $500.00", () => {
    // 10 tracks at $50 = $500.
    expect(cartTotalCents(trackCart(10))).toBe(50000);
    expect(formatUsd(cartTotalCents(trackCart(10)))).toBe("$500.00");
  });
});

describe("tier crossing re-prices the whole cart", () => {
  it("the 6th track drops every track to the album rate", () => {
    // 5 tracks at $58 = $290, then 6 tracks at $50 = $300.
    expect(cartTotalCents(trackCart(5))).toBe(29000);
    expect(cartTotalCents(trackCart(6))).toBe(30000);
  });
});

describe("add-ons", () => {
  it("stems add $40 per track", () => {
    let cart = trackCart(1);
    cart = setAddon(cart, cart.tracks[0].id, "stems", 1);
    // base $65 + stems $40 = $105.
    expect(cartTotalCents(cart)).toBe(10500);
  });

  it("per-track add-ons price one unit per track regardless of qty", () => {
    let cart = trackCart(1);
    cart = setAddon(cart, cart.tracks[0].id, "rush", 3);
    // rush is per-track: base $65 + rush $30 = $95.
    expect(cartTotalCents(cart)).toBe(9500);
  });

  it("per-item add-ons multiply by quantity", () => {
    let cart = trackCart(1);
    cart = setAddon(cart, cart.tracks[0].id, "altVersion", 2);
    cart = setAddon(cart, cart.tracks[0].id, "extraFormat", 3);
    // base $65 + altVersion 2 x $15 ($30) + extraFormat 3 x $20 ($60) = $155.
    expect(cartTotalCents(cart)).toBe(15500);
  });
});

describe("lineItems", () => {
  it("emits one track line plus one line per add-on instance", () => {
    let cart = trackCart(2);
    cart = setAddon(cart, cart.tracks[0].id, "stems", 1);
    cart = setAddon(cart, cart.tracks[0].id, "altVersion", 2);
    const items = lineItems(cart);
    // 2 track lines + stems line + altVersion line = 4 lines.
    expect(items).toHaveLength(4);
    expect(items.filter((i) => i.kind === "track")).toHaveLength(2);
    expect(items.filter((i) => i.kind === "addon")).toHaveLength(2);
  });

  it("defaults an unnamed track to its 1-based position, not Untitled", () => {
    let cart = trackCart(0);
    cart = addTrack(cart, ""); // track 1, blank title
    cart = addTrack(cart, ""); // track 2, blank title
    const labels = lineItems(cart)
      .filter((i) => i.kind === "track")
      .map((i) => i.label);
    expect(labels).toEqual(["Track 1", "Track 2"]);
    expect(labels).not.toContain("Untitled track");
  });

  it("keeps a real title and uses position only for the blanks", () => {
    let cart = trackCart(0);
    cart = addTrack(cart, "Night Drive");
    cart = addTrack(cart, "");
    const labels = lineItems(cart)
      .filter((i) => i.kind === "track")
      .map((i) => i.label);
    expect(labels).toEqual(["Night Drive", "Track 2"]);
  });

  it("the total recompute matches the lineItems sum", () => {
    let cart = trackCart(4);
    cart = setAddon(cart, cart.tracks[0].id, "stems", 1);
    cart = setAddon(cart, cart.tracks[1].id, "extraFormat", 2);
    cart = setAddon(cart, cart.tracks[2].id, "extraRevision", 1);
    const sum = lineItems(cart).reduce((s, i) => s + i.amountCents, 0);
    expect(cartTotalCents(cart)).toBe(sum);
  });
});

describe("cartHasAddon", () => {
  it("is false when no track has the add-on", () => {
    expect(cartHasAddon(trackCart(3), "stems")).toBe(false);
  });

  it("is true when any track has the add-on enabled", () => {
    let cart = trackCart(3);
    cart = setAddon(cart, cart.tracks[1].id, "stems", 1);
    expect(cartHasAddon(cart, "stems")).toBe(true);
  });
});

describe("quoteOnly", () => {
  it("is false for a plain cart", () => {
    expect(quoteOnly(trackCart(3))).toBe(false);
  });

  it("is true when any track has Atmos", () => {
    let cart = trackCart(2);
    cart = setAddon(cart, cart.tracks[1].id, "atmos", 1);
    expect(quoteOnly(cart)).toBe(true);
  });

  it("Atmos is flagged quoteOnly in the catalog", () => {
    const atmos = ADDONS.find((a) => a.id === "atmos");
    expect(atmos?.quoteOnly).toBe(true);
  });
});

describe("formatUsd", () => {
  it("formats whole and fractional dollars", () => {
    expect(formatUsd(6500)).toBe("$65.00");
    expect(formatUsd(5)).toBe("$0.05");
    expect(formatUsd(0)).toBe("$0.00");
    expect(formatUsd(123456)).toBe("$1234.56");
  });
});
