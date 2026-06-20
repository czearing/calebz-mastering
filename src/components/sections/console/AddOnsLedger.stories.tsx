import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { EMPTY_ADDON_STATE, type ConsoleAddonState } from "@/lib/checkout";
import { AddOnsLedger } from "./AddOnsLedger";

function Interactive() {
  const [addons, setAddons] = useState<ConsoleAddonState>(EMPTY_ADDON_STATE);
  return <AddOnsLedger addons={addons} onChange={setAddons} />;
}

const meta: Meta<typeof AddOnsLedger> = {
  title: "Sections/Services/AddOnsLedger",
  component: AddOnsLedger,
  parameters: { layout: "padded" },
};

export default meta;

type Story = StoryObj<typeof AddOnsLedger>;

// Quiet right-aligned ledger. Per-track toggles, per-item counts, and the
// quote-gated Atmos row that sets a flag without touching the total.
export const Default: Story = { render: () => <Interactive /> };
