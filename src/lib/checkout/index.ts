// Barrel for the pure checkout pricing/cart domain core.
// Single source of truth imported by client (live pricing) and
// server (authoritative re-price). See plan/29-services-checkout.md.

export type {
  AddonId,
  AddonPer,
  Addon,
  CartTrack,
  Cart,
  LineItem,
} from "./types";

export {
  ADDONS,
  pricePerTrackCents,
  lineItems,
  cartTotalCents,
  cartHasAddon,
  quoteOnly,
  formatUsd,
} from "./catalog";

export { reviewSummary, tierLabel } from "./review";
export type { ReviewSummary, ReviewAddon } from "./review";

export {
  emptyCart,
  addTrack,
  removeTrack,
  setTrackTitle,
  setAddon,
} from "./cart";

export {
  EMPTY_ADDON_STATE,
  buildConsoleCart,
  buildHydrationCart,
  cartToConsole,
  consoleTotalCents,
  consoleQuoteRequested,
  addonUnitCents,
  toQueryString,
  parseQuery,
} from "./console";
export type { ConsoleAddonState } from "./console";
