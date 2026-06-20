import type { Meta, StoryObj } from "@storybook/react";
import { ScrollCue } from "./ScrollCue";

// The cue reads scroll position from the window, so at rest in a docs frame it
// shows at the top of the page and the playhead nudges along the hairline.
const meta: Meta<typeof ScrollCue> = {
  title: "UI/ScrollCue",
  component: ScrollCue,
};

export default meta;

type Story = StoryObj<typeof ScrollCue>;

export const Default: Story = {};

export const InContext: Story = {
  render: () => (
    <div className="flex min-h-[40svh] items-end justify-center">
      <ScrollCue />
    </div>
  ),
};
