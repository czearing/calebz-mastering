import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { ADDONS } from "@/lib/checkout";
import { AddonChip } from "./AddonChip";

const stems = ADDONS.find((a) => a.id === "stems")!;
const altVersion = ADDONS.find((a) => a.id === "altVersion")!;
const atmos = ADDONS.find((a) => a.id === "atmos")!;

function Interactive({ addon }: { addon: (typeof ADDONS)[number] }) {
  const [qty, setQty] = useState(0);
  return <AddonChip addon={addon} qty={qty} onChange={setQty} />;
}

const meta: Meta<typeof AddonChip> = {
  title: "Checkout/AddonChip",
  component: AddonChip,
  parameters: { layout: "padded" },
};

export default meta;

type Story = StoryObj<typeof AddonChip>;

// Per-track toggle: an aria-pressed button.
export const Toggle: Story = { render: () => <Interactive addon={stems} /> };

// Per-item add-on with a quantity stepper.
export const Quantity: Story = {
  render: () => <Interactive addon={altVersion} />,
};

// Quote-only add-on, labelled as such.
export const QuoteOnly: Story = { render: () => <Interactive addon={atmos} /> };
