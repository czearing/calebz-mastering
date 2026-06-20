import type { Meta, StoryObj } from "@storybook/react";
import {
  addTrack,
  cartTotalCents,
  emptyCart,
  quoteOnly,
  reviewSummary,
  setAddon,
} from "@/lib/checkout";
import { SummaryStep } from "./SummaryStep";

function epCart() {
  let cart = emptyCart();
  for (let i = 0; i < 6; i++) cart = addTrack(cart, "");
  cart = setAddon(cart, cart.tracks[0].id, "stems", 1);
  return cart;
}

const cart = epCart();

const meta: Meta<typeof SummaryStep> = {
  title: "Checkout/SummaryStep",
  component: SummaryStep,
  parameters: { layout: "padded" },
  args: {
    summary: reviewSummary(cart),
    totalCents: cartTotalCents(cart),
    isQuote: quoteOnly(cart),
    hasStems: true,
    index: 1,
    count: 4,
  },
};

export default meta;

type Story = StoryObj<typeof SummaryStep>;

// The seeded Review step: an Album grouped into one header line plus an
// aggregated add-on line, with the total in the sticky bar. Step 1 of 4.
export const Default: Story = {};

// A two-track single with an add-on, the smallest grouped order.
export const Single: Story = {
  args: (() => {
    const c = setAddon(
      addTrack(addTrack(emptyCart(), "Night Drive"), "Afterglow"),
      "track-1",
      "rush",
      1,
    );
    return {
      summary: reviewSummary(c),
      totalCents: cartTotalCents(c),
      isQuote: quoteOnly(c),
      index: 1,
      count: 4,
    };
  })(),
};
