import type { Meta, StoryObj } from "@storybook/react";
import { AlbumCard } from "./AlbumCard";
import { placeholderPair } from "@/content/audio";
import type { Track } from "@/content";

const track: Track = {
  id: "first-light",
  title: "First Light",
  artist: "Kessler",
  genres: ["Techno"],
  cover: "/work/for-me.jpg",
  audio: placeholderPair(1),
};

const meta: Meta<typeof AlbumCard> = {
  title: "Work/AlbumCard",
  component: AlbumCard,
  parameters: { layout: "centered" },
  args: { track, onOpen: () => {} },
  decorators: [
    (Story) => (
      <div style={{ width: 320 }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof AlbumCard>;

// At rest the cover is grey; hover with a mouse to tilt it and resolve to color.
export const Default: Story = {};
