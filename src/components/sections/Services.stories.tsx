import type { Meta, StoryObj } from "@storybook/react";
import { Services } from "./Services";

const meta: Meta<typeof Services> = {
  title: "Sections/Services",
  component: Services,
  parameters: { layout: "fullscreen" },
};

export default meta;

type Story = StoryObj<typeof Services>;

// The live console: a track stepper drives the tier rail, the add-ons ledger,
// and one oversized live total that rolls as the config changes. The CTA
// serializes the order into /start.
export const Default: Story = {};
