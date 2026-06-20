import type { Meta, StoryObj } from "@storybook/react";
import { HeroActions } from "./HeroActions";

const meta: Meta<typeof HeroActions> = {
  title: "Sections/HeroActions",
  component: HeroActions,
  parameters: { layout: "padded" },
  args: { primaryAction: "Start a master" },
};

export default meta;

type Story = StoryObj<typeof HeroActions>;

// The one dominant above-the-fold CTA, routing to the order console.
export const Default: Story = {};
