import type { Meta, StoryObj } from "@storybook/react";
import { Header } from "./Header";

// Story pattern under "UI/<Name>". The header is fixed, so render it on a tall
// frame to read it in place. The a11y addon checks nav roles and contrast.
const meta: Meta<typeof Header> = {
  title: "UI/Header",
  component: Header,
  parameters: { layout: "fullscreen" },
  decorators: [
    (Story) => (
      <div className="min-h-[200vh] bg-bg">
        <Story />
      </div>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof Header>;

// Default content: wordmark, the three anchors, and the Book button.
export const Default: Story = {};
