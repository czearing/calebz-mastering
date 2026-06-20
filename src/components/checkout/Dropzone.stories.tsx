import type { Meta, StoryObj } from "@storybook/react";
import { Dropzone } from "./Dropzone";

const meta: Meta<typeof Dropzone> = {
  title: "Checkout/Dropzone",
  component: Dropzone,
  parameters: { layout: "padded" },
  args: { orderId: "demo-order" },
};

export default meta;

type Story = StoryObj<typeof Dropzone>;

// Drag-drop or browse, with prep guidance and the resume line. A flat order:
// one file per track.
export const Default: Story = {};

// A stem order: the guidance switches to grouped stems, multiple files per
// track, so it no longer contradicts what the customer paid for.
export const Stems: Story = {
  args: { needsStems: true },
};
