import type { Meta, StoryObj } from "@storybook/react";
import { Contact } from "./Contact";

const meta: Meta<typeof Contact> = {
  title: "Sections/Contact",
  component: Contact,
  parameters: { layout: "fullscreen" },
};

export default meta;

type Story = StoryObj<typeof Contact>;

export const Default: Story = {};
