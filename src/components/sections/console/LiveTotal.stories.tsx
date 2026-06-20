import type { Meta, StoryObj } from "@storybook/react";
import { EMPTY_ADDON_STATE, consoleTotalCents } from "@/lib/checkout";
import { LiveTotal } from "./LiveTotal";
import { tierForCount } from "./tiers";

const meta: Meta<typeof LiveTotal> = {
  title: "Sections/Services/LiveTotal",
  component: LiveTotal,
  parameters: { layout: "centered" },
};

export default meta;

type Story = StoryObj<typeof LiveTotal>;

// The hero figure. Odometer-rolls on change, breathes with --audio-energy, and
// announces "{tier}, {dollars} dollars, {n} tracks" via an aria-live region.
export const EP: Story = {
  args: {
    totalCents: consoleTotalCents(3, EMPTY_ADDON_STATE),
    tier: tierForCount(3),
    trackCount: 3,
    breakdown: "3 x $58/track",
    atmosRequested: false,
  },
};

export const AlbumWithAtmos: Story = {
  args: {
    totalCents: consoleTotalCents(6, EMPTY_ADDON_STATE),
    tier: tierForCount(6),
    trackCount: 6,
    breakdown: "6 x $50/track",
    atmosRequested: true,
  },
};
