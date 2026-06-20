import type { Meta, StoryObj } from "@storybook/react";
import { MobileBookBar } from "./MobileBookBar";

// The persistent mobile Book bar. It only shows below md, so view this story at
// a phone width. It hides once the watched section scrolls into view.
const meta: Meta<typeof MobileBookBar> = {
  title: "Sections/MobileBookBar",
  component: MobileBookBar,
  parameters: { layout: "fullscreen" },
  decorators: [
    (Story) => (
      <div className="min-h-[120vh] bg-bg">
        <Story />
      </div>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof MobileBookBar>;

export const Default: Story = {};
