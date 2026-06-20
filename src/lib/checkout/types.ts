// Pure domain types for the mastering checkout cart and pricing.
// No React, no DOM, no env. Imported by both client (live pricing)
// and server (authoritative re-price). See plan/29-services-checkout.md.

// The add-ons offered beyond the generous, never-line-itemed base
// (one WAV plus MP3, two revisions, standard turnaround).
export type AddonId =
  | "stems"
  | "rush"
  | "altVersion"
  | "extraFormat"
  | "extraRevision"
  | "atmos";

// Whether an add-on is charged per track or per discrete item.
// "track" add-ons price as priceCents times track count when enabled
// (quantity is treated as 1 per track). "item" add-ons price as
// priceCents times the chosen quantity (altVersion, extraFormat can be >1).
export type AddonPer = "track" | "item";

export interface Addon {
  id: AddonId;
  label: string;
  priceCents: number;
  per: AddonPer;
  // Atmos is quote-gated: configurable but not directly payable.
  quoteOnly?: boolean;
}

// A single track in the cart. The addons map holds the chosen quantity
// per add-on. For "track" add-ons the quantity is 0 (off) or 1 (on).
// For "item" add-ons the quantity can be any non-negative integer.
export interface CartTrack {
  id: string;
  title: string;
  addons: Partial<Record<AddonId, number>>;
}

export interface Cart {
  tracks: CartTrack[];
}

// One priced row for the cart and the server re-price. Either a track
// base line or a single add-on instance line.
export interface LineItem {
  label: string;
  amountCents: number;
  kind: "track" | "addon";
}
