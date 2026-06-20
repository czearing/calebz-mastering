import type { Meta, StoryObj } from "@storybook/react";
import { WorkGrid } from "./WorkGrid";
import { work } from "@/content";

const meta: Meta<typeof WorkGrid> = {
  title: "Work/WorkGrid",
  component: WorkGrid,
  parameters: { layout: "padded" },
  args: { tracks: work.tracks },
};

export default meta;

type Story = StoryObj<typeof WorkGrid>;

// The full grid: hover a card to scrub its preview, open one to morph into proof.
export const Default: Story = {};

// One card, to confirm the grid reflows down to a single column with no overflow.
export const SingleCard: Story = {
  args: { tracks: work.tracks.slice(0, 1) },
};
