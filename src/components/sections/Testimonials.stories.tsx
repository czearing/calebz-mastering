import type { Meta, StoryObj } from "@storybook/react";
import { Testimonials } from "./Testimonials";

const meta: Meta<typeof Testimonials> = {
  title: "Sections/Testimonials",
  component: Testimonials,
  parameters: { layout: "fullscreen" },
};

export default meta;

type Story = StoryObj<typeof Testimonials>;

export const Default: Story = {};

export const Empty: Story = {
  args: { content: { title: "What artists say", items: [] } },
};
