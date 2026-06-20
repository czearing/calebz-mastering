import type { Meta, StoryObj } from "@storybook/react";
import { Field } from "./Field";

const meta: Meta<typeof Field> = {
  title: "UI/Field",
  component: Field,
  parameters: { layout: "padded" },
  args: { label: "Email" },
};

export default meta;

type Story = StoryObj<typeof Field>;

export const Text: Story = {
  args: { label: "Email", type: "email", placeholder: "you@studio.com" },
};

export const WithHint: Story = {
  args: {
    label: "Project name",
    hint: "The working title is fine.",
    placeholder: "Untitled",
  },
};

export const WithError: Story = {
  args: {
    label: "Email",
    type: "email",
    defaultValue: "not-an-email",
    error: "Enter a valid email address.",
  },
};

export const Textarea: Story = {
  args: {
    as: "textarea",
    label: "Tell us about the track",
    rows: 4,
    placeholder: "Genre, references, deadline.",
  },
};
