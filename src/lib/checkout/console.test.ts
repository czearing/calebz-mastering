// Console bridge tests. Proves buildConsoleCart's total equals the catalog
// math (via cartTotalCents, not a hardcoded copy) for representative configs,
// and that the query round-trips. Atmos must be excluded from the total but
// flagged as a quote.

import { describe, it, expect } from "vitest";
import {
  EMPTY_ADDON_STATE,
  buildConsoleCart,
  buildHydrationCart,
  consoleQuoteRequested,
  consoleTotalCents,
  parseQuery,
  toQueryString,
  type ConsoleAddonState,
} from "./console";
import { cartTotalCents, pricePerTrackCents, quoteOnly } from "./catalog";

function state(overrides: Partial<ConsoleAddonState>): ConsoleAddonState {
  return { ...EMPTY_ADDON_STATE, ...overrides };
}

describe("buildConsoleCart track pricing", () => {
  it("1 track is the single rate", () => {
    const cart = buildConsoleCart(1, EMPTY_ADDON_STATE);
    expect(cart.tracks).toHaveLength(1);
    expect(cartTotalCents(cart)).toBe(pricePerTrackCents(1) * 1);
    expect(cartTotalCents(cart)).toBe(6500);
  });

  it("3 tracks re-price the whole release at the EP rate", () => {
    const cart = buildConsoleCart(3, EMPTY_ADDON_STATE);
    expect(cart.tracks).toHaveLength(3);
    expect(cartTotalCents(cart)).toBe(pricePerTrackCents(3) * 3);
    expect(cartTotalCents(cart)).toBe(17400);
  });

  it("6 tracks re-price the whole release at the album rate", () => {
    const cart = buildConsoleCart(6, EMPTY_ADDON_STATE);
    expect(cart.tracks).toHaveLength(6);
    expect(cartTotalCents(cart)).toBe(pricePerTrackCents(6) * 6);
    expect(cartTotalCents(cart)).toBe(30000);
  });

  it("forces at least one track for a priceable cart", () => {
    const cart = buildConsoleCart(0, EMPTY_ADDON_STATE);
    expect(cart.tracks).toHaveLength(1);
  });
});

describe("buildConsoleCart per-track add-ons apply to every track", () => {
  it("stems add their unit price for each track", () => {
    const cart = buildConsoleCart(3, state({ stems: true }));
    // 3 x $58 base + 3 x $40 stems = $174 + $120 = $294.
    expect(cartTotalCents(cart)).toBe(29400);
  });

  it("rush and extra revision each apply per track", () => {
    const cart = buildConsoleCart(2, state({ rush: true, extraRevision: true }));
    // 2 x $65 + 2 x $30 + 2 x $25 = $130 + $60 + $50 = $240.
    expect(cartTotalCents(cart)).toBe(24000);
  });
});

describe("buildConsoleCart per-item add-ons reflect their count", () => {
  it("alternate versions multiply by the chosen quantity", () => {
    const cart = buildConsoleCart(1, state({ altVersion: 2 }));
    // $65 + 2 x $15 = $95.
    expect(cartTotalCents(cart)).toBe(9500);
  });

  it("extra formats multiply by the chosen quantity", () => {
    const cart = buildConsoleCart(1, state({ extraFormat: 3 }));
    // $65 + 3 x $20 = $125.
    expect(cartTotalCents(cart)).toBe(12500);
  });
});

describe("Atmos is quote-gated", () => {
  it("is excluded from the live console total", () => {
    const plain = consoleTotalCents(2, EMPTY_ADDON_STATE);
    const withAtmos = consoleTotalCents(2, state({ atmos: true }));
    expect(withAtmos).toBe(plain);
    // Sanity: a real surcharge would be $150/track; it must not appear.
    expect(withAtmos).toBe(13000);
  });

  it("is reported as a quote request from the console state", () => {
    expect(consoleQuoteRequested(state({ atmos: true }))).toBe(true);
    expect(consoleQuoteRequested(EMPTY_ADDON_STATE)).toBe(false);
  });

  it("the hydration cart carries Atmos so checkout flags a quote", () => {
    const plain = buildHydrationCart(2, EMPTY_ADDON_STATE);
    const atmos = buildHydrationCart(2, state({ atmos: true }));
    expect(quoteOnly(plain)).toBe(false);
    expect(quoteOnly(atmos)).toBe(true);
    // Even on the hydration cart, the non-Atmos lines match the live total.
    expect(consoleTotalCents(2, state({ atmos: true }))).toBe(
      cartTotalCents(plain),
    );
  });
});

describe("query serialization round-trips", () => {
  it("omits zero flags and keeps tracks", () => {
    expect(toQueryString(3, EMPTY_ADDON_STATE)).toBe("tracks=3");
  });

  it("serializes every active option", () => {
    const qs = toQueryString(
      4,
      state({ stems: true, altVersion: 2, atmos: true }),
    );
    const parsed = parseQuery(new URLSearchParams(qs));
    expect(parsed.trackCount).toBe(4);
    expect(parsed.addons.stems).toBe(true);
    expect(parsed.addons.altVersion).toBe(2);
    expect(parsed.addons.atmos).toBe(true);
    expect(parsed.addons.rush).toBe(false);
  });

  it("parses a Next.js searchParams record and defaults safely", () => {
    const parsed = parseQuery({ tracks: "6", rush: "1", extraFormat: "2" });
    expect(parsed.trackCount).toBe(6);
    expect(parsed.addons.rush).toBe(true);
    expect(parsed.addons.extraFormat).toBe(2);
    expect(parsed.addons.atmos).toBe(false);
  });

  it("defaults to one track when tracks is missing or invalid", () => {
    expect(parseQuery({}).trackCount).toBe(1);
    expect(parseQuery({ tracks: "nonsense" }).trackCount).toBe(1);
  });

  it("the parsed cart total matches the original config total", () => {
    const config = state({ rush: true, extraFormat: 2 });
    const original = buildConsoleCart(6, config);
    const qs = toQueryString(6, config);
    const parsed = parseQuery(new URLSearchParams(qs));
    const rebuilt = buildConsoleCart(parsed.trackCount, parsed.addons);
    expect(cartTotalCents(rebuilt)).toBe(cartTotalCents(original));
  });
});
