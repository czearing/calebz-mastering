import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import {
  addTrack,
  cartTotalCents,
  emptyCart,
  reviewSummary,
  setAddon,
  type Cart,
} from "@/lib/checkout";
import { UploadStep } from "./UploadStep";
import { useUpload } from "./useUpload";
import { payerDefaults, type PayerInput } from "./payerSchema";

function flatCart() {
  let cart = emptyCart();
  for (let i = 0; i < 3; i++) cart = addTrack(cart, "");
  return cart;
}

function stemCart() {
  let cart = flatCart();
  for (const track of cart.tracks) cart = setAddon(cart, track.id, "stems", 1);
  return cart;
}

// A live wrapper so the dropzone and the contact fields behave as they do in the
// flow: the parent owns the payer and the uploaded files.
function Live({ cart }: { cart: Cart }) {
  const [payer, setPayer] = useState<PayerInput>(payerDefaults);
  const upload = useUpload("demo-order");
  return (
    <UploadStep
      cart={cart}
      summary={reviewSummary(cart)}
      totalCents={cartTotalCents(cart)}
      index={2}
      count={4}
      orderId="demo-order"
      payer={payer}
      onPayerChange={setPayer}
      items={upload.items}
      onAddFiles={upload.add}
      onRemoveFile={upload.remove}
      onBack={() => {}}
      onContinue={() => {}}
    />
  );
}

const meta: Meta<typeof UploadStep> = {
  title: "Checkout/UploadStep",
  component: UploadStep,
  parameters: { layout: "padded" },
};

export default meta;

type Story = StoryObj<typeof UploadStep>;

// Send your tracks before paying: name, email, and the dropzone. A flat order,
// so the guidance reads "one file per track" and the count reads "of 3 tracks".
export const Default: Story = {
  render: () => <Live cart={flatCart()} />,
};

// A stem order: the dropzone guidance switches to grouped stems, multiple files
// per track, so it no longer contradicts what the customer paid for.
export const Stems: Story = {
  render: () => <Live cart={stemCart()} />,
};
