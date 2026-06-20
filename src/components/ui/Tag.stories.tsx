import type { Meta, StoryObj } from "@storybook/react";
import { Tag } from "./Tag";

const meta: Meta<typeof Tag> = {
  title: "UI/Tag",
  component: Tag,
  parameters: { layout: "centered" },
  args: { children: "Hip hop" },
};

export default meta;

type Story = StoryObj<typeof Tag>;

export const Default: Story = {};
export const Numeric: Story = { args: { children: "-14 LUFS" } };
export const Genre: Story = { args: { children: "Indie rock" } };
