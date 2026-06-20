// Pure bridge between the live Services console and the checkout cart, so the
// console and the /start flow can never disagree on price. The console state is
// a small, flat shape; this module turns it into a real Cart and serializes it
// to and from URL query params. All pricing still flows through catalog.ts
// (cartTotalCents); nothing here hardcodes a dollar figure. See the services
// redesign brief ("The Console").

import { addTrack, emptyCart, setAddon } from "./cart";
import { ADDONS, cartTotalCents } from "./catalog";
import type { AddonId, Cart } from "./types";

// The console exposes a subset of add-ons. Per-track add-ons (stems, rush,
// extraRevision) are on/off and apply to every track. Per-item add-ons
// (altVersion, extraFormat) are integer counts. Atmos is a quote-gated flag:
// it never adds to the live total, it only marks the order for a quote.
export interface ConsoleAddonState {
  stems: boolean;
  rush: boolean;
  extraRevision: boolean;
  altVersion: number;
  extraFormat: number;
  atmos: boolean;
}

export const EMPTY_ADDON_STATE: ConsoleAddonState = {
  stems: false,
  rush: false,
  extraRevision: false,
  altVersion: 0,
  extraFormat: 0,
  atmos: false,
};

// The per-track on/off add-ons the console offers, with their catalog ids.
const TRACK_ADDONS: { id: AddonId; key: "stems" | "rush" | "extraRevision" }[] =
  [
    { id: "stems", key: "stems" },
    { id: "rush", key: "rush" },
    { id: "extraRevision", key: "extraRevision" },
  ];

function clampCount(n: number): number {
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.trunc(n));
}

// Build a real Cart from the console state. Track count is forced to at least
// one so the cart is always priceable. Per-track add-ons are applied to every
// track (one unit each, matching catalog per-track pricing). Per-item add-on
// counts are placed on the first track, where lineItems multiplies priceCents
// by the count, so the cart total reflects the chosen quantity exactly.
//
// Atmos is quote-gated. catalog.cartTotalCents sums every line including
// quote-only add-ons, so to keep Atmos out of the live total we DO NOT add it
// to the priced cart here. Instead the caller passes the atmos flag on to
// /start (and to consoleQuoteRequested) so it is noted at checkout. This
// guarantees the displayed total never includes the Atmos surcharge.
export function buildConsoleCart(
  trackCount: number,
  addons: ConsoleAddonState,
): Cart {
  const n = Math.max(1, clampCount(trackCount));
  let cart = emptyCart();
  for (let i = 0; i < n; i++) {
    cart = addTrack(cart, "");
  }

  const ids = cart.tracks.map((t) => t.id);
  const first = ids[0];

  for (const { id, key } of TRACK_ADDONS) {
    if (!addons[key]) continue;
    for (const trackId of ids) {
      cart = setAddon(cart, trackId, id, 1);
    }
  }

  const altVersion = clampCount(addons.altVersion);
  if (altVersion > 0) cart = setAddon(cart, first, "altVersion", altVersion);
  const extraFormat = clampCount(addons.extraFormat);
  if (extraFormat > 0) cart = setAddon(cart, first, "extraFormat", extraFormat);

  return cart;
}

// The cart handed to /start for hydration. Same as the priced console cart but
// with Atmos applied to the first track when requested, so the existing
// checkout flags the order as quote-only (quoteOnly(cart) is true) and notes
// the Atmos request at checkout. The live console total is computed from
// consoleTotalCents (no Atmos), so the displayed figure and this hydration cart
// stay consistent with the brief: Atmos is gated, not silently priced in.
export function buildHydrationCart(
  trackCount: number,
  addons: ConsoleAddonState,
): Cart {
  let cart = buildConsoleCart(trackCount, addons);
  if (addons.atmos && cart.tracks[0]) {
    cart = setAddon(cart, cart.tracks[0].id, "atmos", 1);
  }
  return cart;
}

// Reverse of buildConsoleCart: read a cart back into the flat console shape so
// the checkout Review step can edit the order in place with the same stepper
// and add-on controls the console uses, instead of sending the customer back to
// the homepage builder (which would reset their configuration). Per-track
// add-ons are applied to every track, so the first track reflects them; per-item
// counts live on the first track. See plan/32.
export function cartToConsole(cart: Cart): {
  trackCount: number;
  addons: ConsoleAddonState;
} {
  const first = cart.tracks[0];
  const on = (id: AddonId): boolean => !!first && (first.addons[id] ?? 0) > 0;
  const num = (id: AddonId): number =>
    cart.tracks.reduce((sum, t) => sum + (t.addons[id] ?? 0), 0);
  return {
    trackCount: Math.max(1, cart.tracks.length),
    addons: {
      stems: on("stems"),
      rush: on("rush"),
      extraRevision: on("extraRevision"),
      altVersion: num("altVersion"),
      extraFormat: num("extraFormat"),
      atmos: on("atmos"),
    },
  };
}

// The live console total in cents. Always equal to cartTotalCents of the priced
// cart, which by construction excludes Atmos. This is the single number the
// console displays; reading it through cartTotalCents keeps the console and the
// cart in lockstep and means no price is ever hardcoded in the UI.
export function consoleTotalCents(
  trackCount: number,
  addons: ConsoleAddonState,
): number {
  return cartTotalCents(buildConsoleCart(trackCount, addons));
}

// Whether the configured order needs a quote. Atmos is the only quote gate.
export function consoleQuoteRequested(addons: ConsoleAddonState): boolean {
  return addons.atmos;
}

// The per-item unit price in cents for the breakdown line, read from the
// catalog so the console never hardcodes it.
export function addonUnitCents(id: AddonId): number {
  return ADDONS.find((a) => a.id === id)?.priceCents ?? 0;
}

// Serialize the console config into a flat, documented query string for /start.
// Scheme: tracks=N&stems=0|1&rush=0|1&extraRevision=0|1&altVersion=K&
// extraFormat=K&atmos=0|1. Only tracks is always present; zero-valued flags and
// counts are omitted to keep the URL short, and parse() defaults them to off.
export function toQueryString(
  trackCount: number,
  addons: ConsoleAddonState,
): string {
  const params = new URLSearchParams();
  params.set("tracks", String(Math.max(1, clampCount(trackCount))));
  if (addons.stems) params.set("stems", "1");
  if (addons.rush) params.set("rush", "1");
  if (addons.extraRevision) params.set("extraRevision", "1");
  const alt = clampCount(addons.altVersion);
  if (alt > 0) params.set("altVersion", String(alt));
  const fmt = clampCount(addons.extraFormat);
  if (fmt > 0) params.set("extraFormat", String(fmt));
  if (addons.atmos) params.set("atmos", "1");
  return params.toString();
}

function flag(value: string | undefined): boolean {
  return value === "1" || value === "true";
}

function count(value: string | undefined): number {
  return clampCount(Number(value ?? 0));
}

// Parse the query params back into a console config. Tolerant of missing or
// malformed values: a missing tracks defaults to one, flags default to off.
// Accepts a URLSearchParams or a plain record (Next.js searchParams).
export function parseQuery(
  input: URLSearchParams | Record<string, string | string[] | undefined>,
): { trackCount: number; addons: ConsoleAddonState } {
  const get = (key: string): string | undefined => {
    if (input instanceof URLSearchParams) return input.get(key) ?? undefined;
    const raw = input[key];
    return Array.isArray(raw) ? raw[0] : raw;
  };

  const tracks = Math.max(1, count(get("tracks")) || 1);
  return {
    trackCount: tracks,
    addons: {
      stems: flag(get("stems")),
      rush: flag(get("rush")),
      extraRevision: flag(get("extraRevision")),
      altVersion: count(get("altVersion")),
      extraFormat: count(get("extraFormat")),
      atmos: flag(get("atmos")),
    },
  };
}
