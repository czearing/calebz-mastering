import type { Meta, StoryObj } from "@storybook/react";
import { CheckoutCTA } from "./CheckoutCTA";

const meta: Meta<typeof CheckoutCTA> = {
  title: "Sections/Services/CheckoutCTA",
  component: CheckoutCTA,
  parameters: { layout: "centered" },
};

export default meta;

type Story = StoryObj<typeof CheckoutCTA>;

// The only filled cyan control. A real link carrying the configured order, with
// a magnetic cursor-follow and an --audio-energy glow.
export const Default: Story = {
  args: { href: "/start?tracks=3&stems=1" },
};

// When Atmos is requested the label shifts to the quote path.
export const QuoteRequested: Story = {
  args: { href: "/start?tracks=2&atmos=1", quote: true },
};
