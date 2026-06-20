import type { Meta, StoryObj } from "@storybook/react";
import { ABPlayer } from "./ABPlayer";
import { sampleBefore, sampleAfter } from "./sample";

const meta: Meta<typeof ABPlayer> = {
  title: "Audio/ABPlayer",
  component: ABPlayer,
  parameters: { layout: "padded" },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 680 }}>
        <Story />
      </div>
    ),
  ],
  args: { before: sampleBefore, after: sampleAfter },
};

export default meta;

type Story = StoryObj<typeof ABPlayer>;

// The signature. One play head, two level-matched sources, a mono toggle.
export const Signature: Story = {};

// Sound-off path still carries the case: peaks plus LUFS and true peak even
// when no loudness numbers are wired (proof degrades to waveforms only).
export const WithoutLoudness: Story = {
  args: {
    before: { ...sampleBefore, loudness: undefined },
    after: { ...sampleAfter, loudness: undefined },
  },
};
