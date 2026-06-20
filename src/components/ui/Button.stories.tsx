import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "./Button";

// Story pattern for every UI primitive: title under "UI/<Name>",
// one story per variant, a11y addon checks contrast and roles.
const meta: Meta<typeof Button> = {
  title: "UI/Button",
  component: Button,
  parameters: { layout: "centered" },
  args: { children: "Book a master" },
  argTypes: {
    variant: { control: "inline-radio", options: ["primary", "ghost", "link"] },
  },
};

export default meta;

type Story = StoryObj<typeof Button>;

export const Primary: Story = { args: { variant: "primary" } };
export const Ghost: Story = { args: { variant: "ghost" } };
export const Link: Story = {
  args: { variant: "link", children: "Hear the work" },
};
export const Disabled: Story = { args: { variant: "primary", disabled: true } };
