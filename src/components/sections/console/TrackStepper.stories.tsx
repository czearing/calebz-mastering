import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { TrackStepper } from "./TrackStepper";

function Interactive() {
  const [count, setCount] = useState(1);
  return <TrackStepper count={count} onChange={setCount} />;
}

const meta: Meta<typeof TrackStepper> = {
  title: "Sections/Services/TrackStepper",
  component: TrackStepper,
  parameters: { layout: "centered" },
};

export default meta;

type Story = StoryObj<typeof TrackStepper>;

// The primary control. Hold a button to accelerate; arrow keys on the count.
export const Default: Story = { render: () => <Interactive /> };
