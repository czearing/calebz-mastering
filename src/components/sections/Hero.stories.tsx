import type { Meta, StoryObj } from "@storybook/react";
import { Hero } from "./Hero";
import { sampleBefore, sampleAfter } from "@/components/audio/sample";

const meta: Meta<typeof Hero> = {
  title: "Sections/Hero",
  component: Hero,
  parameters: { layout: "fullscreen" },
};

export default meta;

type Story = StoryObj<typeof Hero>;

// The signature, with default content and the placeholder A/B previews.
export const Default: Story = {
  args: { before: sampleBefore, after: sampleAfter },
};

// Sound-off path: sources without loudness still carry the visual proof.
export const WithoutLoudness: Story = {
  args: {
    before: { ...sampleBefore, loudness: undefined },
    after: { ...sampleAfter, loudness: undefined },
  },
};
