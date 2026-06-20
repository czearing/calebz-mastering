import type { Meta, StoryObj } from "@storybook/react";
import { Player } from "./Player";
import { sampleAfter } from "./sample";

const meta: Meta<typeof Player> = {
  title: "Audio/Player",
  component: Player,
  parameters: { layout: "padded" },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 560 }}>
        <Story />
      </div>
    ),
  ],
  args: {
    src: sampleAfter.src,
    peaks: sampleAfter.peaks,
    title: "Forest, master",
  },
};

export default meta;

type Story = StoryObj<typeof Player>;

export const Default: Story = {};
export const NoTitle: Story = { args: { title: undefined } };
