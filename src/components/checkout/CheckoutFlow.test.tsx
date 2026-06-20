import { describe, it, expect, vi, beforeAll } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  addTrack,
  buildHydrationCart,
  emptyCart,
  EMPTY_ADDON_STATE,
  formatUsd,
} from "@/lib/checkout";
import { CheckoutFlow } from "./CheckoutFlow";
import { SEEDED_FLOW } from "./useCheckout";

// Reveal/dynamic imports in jsdom want matchMedia present.
beforeAll(() => {
  vi.stubGlobal("matchMedia", (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  }));
});

describe("CheckoutFlow", () => {
  it("starts on the package step and pages forward", async () => {
    render(<CheckoutFlow initialCart={addTrack(emptyCart(), "Night Drive")} />);
    expect(
      screen.getByRole("heading", { name: "Pick your package" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Step 1 of 7")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Continue" }));
    expect(
      screen.getByRole("heading", { name: "Add-ons" }),
    ).toBeInTheDocument();
  });

  it("walks through to the review step and shows the grouped order", async () => {
    render(<CheckoutFlow initialCart={addTrack(emptyCart(), "Night Drive")} />);
    await userEvent.click(screen.getByRole("button", { name: "Continue" })); // addons
    await userEvent.click(screen.getByRole("button", { name: "Continue" })); // tracks
    await userEvent.click(screen.getByRole("button", { name: "Continue" })); // summary
    expect(
      screen.getByRole("heading", { name: "Review your order" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Single")).toBeInTheDocument();
  });

  it("requires at least one track to leave the first step", () => {
    render(<CheckoutFlow />);
    expect(screen.getByRole("button", { name: "Continue" })).toBeDisabled();
  });

  it("runs the seeded 4-step flow and shows Step 1 of 4, not 4 of 7", () => {
    // The seeded hand-off: a built cart and the short upload-first flow, so the
    // artist arrives on Review numbered "of 4", never "of 7".
    const cart = buildHydrationCart(3, {
      ...EMPTY_ADDON_STATE,
      stems: true,
    });
    render(<CheckoutFlow initialCart={cart} flow={SEEDED_FLOW} />);
    expect(
      screen.getByRole("heading", { name: "Review your order" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Step 1 of 4")).toBeInTheDocument();
    expect(screen.queryByText("Step 4 of 7")).not.toBeInTheDocument();
    // The grouped review reads as an EP of 3 tracks.
    expect(screen.getByText("EP")).toBeInTheDocument();
    // 3 x $58 base + 3 x $40 stems = $174 + $120 = $294, shown as the total.
    expect(screen.getAllByText(formatUsd(29400)).length).toBeGreaterThan(0);
  });

  it("pages the seeded flow to the upload step numbered 2 of 4", async () => {
    const cart = buildHydrationCart(2, EMPTY_ADDON_STATE);
    render(<CheckoutFlow initialCart={cart} flow={SEEDED_FLOW} />);
    await userEvent.click(screen.getByRole("button", { name: "Continue" }));
    expect(screen.getByText("Step 2 of 4")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Send your tracks" }),
    ).toBeInTheDocument();
  });

  it("threads the upload payer into the pay step and reaches it at 3 of 4", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        ({ json: async () => ({ configured: false }) }) as unknown as Response,
      ),
    );
    const cart = buildHydrationCart(2, EMPTY_ADDON_STATE);
    render(<CheckoutFlow initialCart={cart} flow={SEEDED_FLOW} />);
    await userEvent.click(screen.getByRole("button", { name: "Continue" }));
    // Continue to payment is blocked until name and email are valid.
    const cta = screen.getByRole("button", { name: "Continue to payment" });
    expect(cta).toBeDisabled();
    await userEvent.type(screen.getByLabelText("Name"), "Ada");
    await userEvent.type(screen.getByLabelText("Email"), "ada@studio.com");
    // Upload-first: a file is required before continuing to payment.
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    await userEvent.upload(
      input,
      new File([new Uint8Array([1, 2, 3])], "track.wav", { type: "audio/wav" }),
    );
    await waitFor(() => expect(cta).toBeEnabled());
    await userEvent.click(cta);
    expect(screen.getByText("Step 3 of 4")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Pay" })).toBeInTheDocument();
  });
});
