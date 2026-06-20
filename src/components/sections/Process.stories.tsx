import type { Meta, StoryObj } from "@storybook/react";
import { Process } from "./Process";

const meta: Meta<typeof Process> = {
  title: "Sections/Process",
  component: Process,
  parameters: { layout: "fullscreen" },
};

export default meta;

type Story = StoryObj<typeof Process>;

export const Default: Story = {};
