import type { Meta, StoryObj } from "@storybook/react";
import { Marquee } from "./Marquee";
import { Tag } from "./Tag";

const meta: Meta<typeof Marquee> = {
  title: "UI/Marquee",
  component: Marquee,
  parameters: { layout: "fullscreen" },
};

export default meta;

type Story = StoryObj<typeof Marquee>;

const items = ["Indie rock", "Hip hop", "Ambient", "Jazz", "Pop", "Folk"];

export const Default: Story = {
  render: () => (
    <Marquee>
      {items.map((label) => (
        <Tag key={label}>{label}</Tag>
      ))}
    </Marquee>
  ),
};

export const Slow: Story = {
  render: () => (
    <Marquee duration={80}>
      {items.map((label) => (
        <Tag key={label}>{label}</Tag>
      ))}
    </Marquee>
  ),
};
