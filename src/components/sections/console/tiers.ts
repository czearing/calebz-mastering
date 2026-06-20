// Shared tier model for the console. Rates come from pricePerTrackCents so the
// rail and the readout never hardcode a price. Each tier knows the entry count
// a tile snaps the stepper to, and its inclusive track range.

import { pricePerTrackCents } from "@/lib/checkout";

export type TierId = "single" | "ep" | "album";

export interface Tier {
  id: TierId;
  label: string;
  range: string;
  entry: number; // stepper count this tier's tile snaps to
  rateCents: number;
}

// The representative count for each tier's rate (1, 3, 6), so the displayed
// /track figure is read from the catalog at the tier's entry point.
export const TIERS: Tier[] = [
  {
    id: "single",
    label: "Single",
    range: "1 to 2 tracks",
    entry: 1,
    rateCents: pricePerTrackCents(1),
  },
  {
    id: "ep",
    label: "EP",
    range: "3 to 5 tracks",
    entry: 3,
    rateCents: pricePerTrackCents(3),
  },
  {
    id: "album",
    label: "Album",
    range: "6+ tracks",
    entry: 6,
    rateCents: pricePerTrackCents(6),
  },
];

// Which tier a track count falls into, by the same thresholds the catalog uses.
export function tierForCount(count: number): Tier {
  if (count <= 2) return TIERS[0];
  if (count <= 5) return TIERS[1];
  return TIERS[2];
}
