"use client";

import { useMemo, useState } from "react";
import {
  type AddonId,
  type Cart,
  addTrack,
  cartTotalCents,
  emptyCart,
  lineItems,
  quoteOnly,
  removeTrack,
  reviewSummary,
  setAddon,
  setTrackTitle,
} from "@/lib/checkout";

// Every step the checkout can render. The shell renders one at a time and the
// hook owns both the cart and the cursor. See plan/30.
export const STEPS = [
  "package",
  "addons",
  "tracks",
  "summary",
  "upload",
  "payment",
  "confirm",
] as const;

export type Step = (typeof STEPS)[number];

// The full builder flow, used only for direct or empty entry to /start. The
// builder already does package, add-ons, and tracks, so a seeded hand-off uses
// SEEDED_FLOW instead and never re-shows those three steps. See plan/32.
export const FULL_FLOW: Step[] = [...STEPS];

// The focused 4-step flow for a seeded hand-off: Review, Send your tracks, Pay,
// Confirm. Upload-first: the customer hands over material before paying.
// Numbered "Step 1 of 4" etc. No "of 7" anywhere. See plan/32.
export const SEEDED_FLOW: Step[] = ["summary", "upload", "payment", "confirm"];

// One cart, one cursor, and pure derived pricing. No fetch, no DOM here so the
// hook stays testable; the steps call the operations they need. The flow is the
// ordered subset of steps to page through: the seeded hand-off passes
// SEEDED_FLOW so numbering reads "of 4" and only Review, Send your tracks, Pay,
// Confirm appear. With no flow it defaults to FULL_FLOW and starts on step one.
export function useCheckout(initial?: Cart, flow: Step[] = FULL_FLOW) {
  const steps = flow.length > 0 ? flow : FULL_FLOW;
  const [cart, setCart] = useState<Cart>(initial ?? emptyCart());
  const [index, setIndex] = useState(0);

  const safeIndex = Math.min(index, steps.length - 1);
  const step = steps[safeIndex];
  const derived = useMemo(
    () => ({
      lines: lineItems(cart),
      review: reviewSummary(cart),
      totalCents: cartTotalCents(cart),
      isQuote: quoteOnly(cart),
      trackCount: cart.tracks.length,
    }),
    [cart],
  );

  return {
    cart,
    step,
    index: safeIndex,
    stepCount: steps.length,
    ...derived,
    next: () => setIndex((i) => Math.min(i + 1, steps.length - 1)),
    back: () => setIndex((i) => Math.max(i - 1, 0)),
    goTo: (target: Step) => {
      const i = steps.indexOf(target);
      if (i >= 0) setIndex(i);
    },
    // Replace the whole cart, used by the Review step to edit the order in
    // place (rebuilt from the console controls) without leaving the checkout.
    setCart,
    addTrack: (title = "") => setCart((c) => addTrack(c, title)),
    removeTrack: (id: string) => setCart((c) => removeTrack(c, id)),
    renameTrack: (id: string, title: string) =>
      setCart((c) => setTrackTitle(c, id, title)),
    setAddon: (trackId: string, addonId: AddonId, qty: number) =>
      setCart((c) => setAddon(c, trackId, addonId, qty)),
  };
}

export type CheckoutState = ReturnType<typeof useCheckout>;
