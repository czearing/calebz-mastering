import type { Meta, StoryObj } from "@storybook/react";
import { Hero } from "./Hero";

const meta: Meta<typeof Hero> = {
  title: "Sections/Hero",
  component: Hero,
  parameters: { layout: "fullscreen" },
};

export default meta;

type Story = StoryObj<typeof Hero>;

// The signature statement, with default content.
export const Default: Story = {};
