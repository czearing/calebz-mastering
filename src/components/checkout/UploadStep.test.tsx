import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useState } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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

function twoFlat() {
  return addTrack(addTrack(emptyCart(), "Night Drive"), "Afterglow");
}
const stemCart = setAddon(addTrack(emptyCart(), "Night Drive"), "track-1", "stems", 1);

// Mirrors how the flow owns the payer and upload list, so the controlled
// UploadStep behaves as it does in CheckoutFlow.
function Harness({ cart, onContinue }: { cart: Cart; onContinue: (p: PayerInput) => void }) {
  const [payer, setPayer] = useState<PayerInput>(payerDefaults);
  const upload = useUpload("o1");
  return (
    <UploadStep
      cart={cart}
      summary={reviewSummary(cart)}
      totalCents={cartTotalCents(cart)}
      index={2}
      count={4}
      orderId="o1"
      payer={payer}
      onPayerChange={setPayer}
      items={upload.items}
      onAddFiles={upload.add}
      onRemoveFile={upload.remove}
      onBack={() => {}}
      onContinue={onContinue}
    />
  );
}

function setup(cart: Cart = twoFlat(), onContinue = vi.fn()) {
  render(<Harness cart={cart} onContinue={onContinue} />);
  return { onContinue };
}

function wav(name = "track.wav") {
  return new File([new Uint8Array([1, 2, 3])], name, { type: "audio/wav" });
}

function fileInput() {
  return document.querySelector('input[type="file"]') as HTMLInputElement;
}

describe("UploadStep", () => {
  beforeEach(() =>
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        ({ json: async () => ({ configured: false }) }) as unknown as Response,
      ),
    ),
  );
  afterEach(() => vi.unstubAllGlobals());

  it("renders the dropzone before payment with the no-charge reassurance", () => {
    setup();
    expect(
      screen.getByRole("button", { name: /Drop your tracks/ }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/No charge yet\. You pay on the next step/),
    ).toBeInTheDocument();
  });

  it("blocks continue until name, email, AND a file are in", async () => {
    const { onContinue } = setup();
    const cta = screen.getByRole("button", { name: "Continue to payment" });
    expect(cta).toBeDisabled();

    await userEvent.type(screen.getByLabelText("Name"), "Ada");
    await userEvent.type(screen.getByLabelText("Email"), "ada@studio.com");
    // Valid contact but no file yet: still blocked, keeping the upload promise.
    expect(cta).toBeDisabled();

    await userEvent.upload(fileInput(), wav());
    await waitFor(() => expect(cta).toBeEnabled());

    await userEvent.click(cta);
    expect(onContinue).toHaveBeenCalledWith({
      name: "Ada",
      email: "ada@studio.com",
    });
  });

  it("shows how the upload maps to the order and lets a file be removed", async () => {
    setup(twoFlat());
    expect(screen.getByText(/0 of 2 tracks added/)).toBeInTheDocument();

    await userEvent.upload(fileInput(), wav("first.wav"));
    expect(await screen.findByText(/1 of 2 tracks added/)).toBeInTheDocument();
    // A flat order with fewer files than tracks is named, not silently allowed.
    expect(
      screen.getByText(/fewer files than the 2 tracks you ordered/),
    ).toBeInTheDocument();

    await userEvent.click(
      screen.getByRole("button", { name: "Remove first.wav" }),
    );
    expect(screen.queryByText("first.wav")).not.toBeInTheDocument();
    expect(screen.getByText(/0 of 2 tracks added/)).toBeInTheDocument();
  });

  it("uses flat guidance for a non-stem order", () => {
    setup(twoFlat());
    expect(screen.getByText(/One file per track/)).toBeInTheDocument();
  });

  it("uses stem-aware guidance when the cart has stem mastering", () => {
    setup(stemCart);
    expect(screen.queryByText(/One file per track/)).not.toBeInTheDocument();
    expect(
      screen.getByText(/Multiple files per track is expected/),
    ).toBeInTheDocument();
  });
});
