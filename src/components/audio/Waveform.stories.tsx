import type { Meta, StoryObj } from "@storybook/react";
import { Waveform } from "./Waveform";
import { makePeaks } from "./types";

const meta: Meta<typeof Waveform> = {
  title: "Audio/Waveform",
  component: Waveform,
  parameters: { layout: "padded" },
  decorators: [
    (Story) => (
      <div style={{ height: 80, width: 480 }}>
        <Story />
      </div>
    ),
  ],
  args: { peaks: makePeaks(120, 7) },
};

export default meta;

type Story = StoryObj<typeof Waveform>;

export const Idle: Story = { args: { progress: 0 } };
export const MidPlay: Story = { args: { progress: 0.45 } };
export const NearEnd: Story = { args: { progress: 0.92 } };
