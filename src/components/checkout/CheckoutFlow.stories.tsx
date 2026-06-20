import type { Meta, StoryObj } from "@storybook/react";
import { buildHydrationCart, EMPTY_ADDON_STATE } from "@/lib/checkout";
import { CheckoutFlow } from "./CheckoutFlow";
import { SEEDED_FLOW } from "./useCheckout";

// The seeded hand-off: an EP with stems, run through the short upload-first
// flow (Review, Send your tracks, Pay, Confirm) exactly as /start renders it.
const seeded = buildHydrationCart(3, { ...EMPTY_ADDON_STATE, stems: true });

const meta: Meta<typeof CheckoutFlow> = {
  title: "Checkout/CheckoutFlow",
  component: CheckoutFlow,
  parameters: { layout: "fullscreen" },
};

export default meta;

type Story = StoryObj<typeof CheckoutFlow>;

// Empty start: the full builder flow, the artist adds their first track.
export const Empty: Story = {};

// Seeded hand-off: the focused upload-first flow starting on Review, numbered
// "Step 1 of 4".
export const Seeded: Story = {
  args: { initialCart: seeded, flow: SEEDED_FLOW },
};
