import type { Meta, StoryObj } from "@storybook/react";
import { Work } from "./Work";
import { placeholderPair } from "@/content/audio";
import type { Work as WorkContent } from "@/content";

const meta: Meta<typeof Work> = {
  title: "Sections/Work",
  component: Work,
  parameters: { layout: "fullscreen" },
};

export default meta;

type Story = StoryObj<typeof Work>;

// The default content: a grid of album cards, each opening a before/after modal.
export const Default: Story = {};

// A single track, to read one card and its modal in isolation.
const single: WorkContent = {
  title: "Selected work",
  line: "Before and after, no processing on the demo. Use headphones.",
  tracks: [
    {
      id: "track-1",
      title: "First Light",
      artist: "Kessler",
      genre: "Techno",
      cover: "/work/for-me.jpg",
      audio: placeholderPair(1),
    },
  ],
};

export const SingleTrack: Story = {
  args: { content: single },
};
