import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { TierRail } from "./TierRail";
import { tierForCount } from "./tiers";

function Interactive() {
  const [count, setCount] = useState(3);
  return <TierRail activeId={tierForCount(count).id} onSnap={setCount} />;
}

const meta: Meta<typeof TierRail> = {
  title: "Sections/Services/TierRail",
  component: TierRail,
  parameters: { layout: "padded" },
};

export default meta;

type Story = StoryObj<typeof TierRail>;

// Read-outs that respond to the count. Clicking a tile snaps to that tier's
// entry count; the active tile carries the cyan outline and an "active" word.
export const Default: Story = { render: () => <Interactive /> };
