import type { Meta, StoryObj } from "@storybook/react";
import { About } from "./About";

// "Meet CalebZ": the founder block (plan/25). Two columns on desktop, stacked
// on mobile. Reads the portrait, founder note, and free-master offer from the
// hero content.
const meta: Meta<typeof About> = {
  title: "Sections/About",
  component: About,
};

export default meta;

type Story = StoryObj<typeof About>;

export const Default: Story = {};
