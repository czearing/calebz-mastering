import type { Meta, StoryObj } from "@storybook/react";
import { Section } from "./Section";

const meta: Meta<typeof Section> = {
  title: "UI/Section",
  component: Section,
};

export default meta;

type Story = StoryObj<typeof Section>;

export const Default: Story = {
  args: {
    children: (
      <p className="text-body">
        Section owns the vertical rhythm and the content max width.
      </p>
    ),
  },
};

export const WithHeading: Story = {
  args: {
    heading: "Selected work",
    children: <p className="text-body">Content sits below the heading slot.</p>,
  },
};

export const Anchored: Story = {
  args: {
    id: "work",
    heading: "Anchored section",
    children: <p className="text-body">This section has an id anchor.</p>,
  },
};
