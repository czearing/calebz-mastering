import type { Meta, StoryObj } from "@storybook/react";
import { Reveal } from "./Reveal";

const meta: Meta<typeof Reveal> = {
  title: "UI/Reveal",
  component: Reveal,
  parameters: { layout: "padded" },
};

export default meta;

type Story = StoryObj<typeof Reveal>;

export const Single: Story = {
  args: {
    children: <p className="text-h2 font-sans">Reveals on enter, once.</p>,
  },
};

export const Staggered: Story = {
  render: () => (
    <div className="flex flex-col gap-[var(--space-4)]">
      {["First", "Second", "Third"].map((label, i) => (
        <Reveal key={label} index={i}>
          <p className="text-h2 font-sans">{label}</p>
        </Reveal>
      ))}
    </div>
  ),
};
