import { describe, it, expect, vi, beforeAll } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
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
  it("starts on the package step and shows the step bar", async () => {
    render(<CheckoutFlow initialCart={addTrack(emptyCart(), "Night Drive")} />);
    expect(
      screen.getByRole("heading", { name: "Pick your package" }),
    ).toBeInTheDocument();
    // The horizontal step bar replaces any "Step 1 of 7" text.
    expect(
      screen.getByRole("list", { name: "Checkout progress" }),
    ).toBeInTheDocument();
    expect(screen.queryByText(/Step 1 of/)).not.toBeInTheDocument();

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

  it("runs the seeded flow starting on Review with the step bar", () => {
    // The seeded hand-off: a built cart and the short flow, so the artist arrives
    // on Review with a step bar, never "Step 4 of 7" text.
    const cart = buildHydrationCart(3, {
      ...EMPTY_ADDON_STATE,
      stems: true,
    });
    render(<CheckoutFlow initialCart={cart} flow={SEEDED_FLOW} />);
    expect(
      screen.getByRole("heading", { name: "Review your order" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("list", { name: "Checkout progress" }),
    ).toBeInTheDocument();
    expect(screen.queryByText(/Step \d of/)).not.toBeInTheDocument();
    // The grouped review reads as an EP of 3 tracks.
    expect(screen.getByText("EP")).toBeInTheDocument();
    // 3 x $58 base + 3 x $40 stems = $174 + $120 = $294, shown as the total.
    expect(screen.getAllByText(formatUsd(29400)).length).toBeGreaterThan(0);
  });

  it("caps the cart to one track and reads Free when the first master is claimed", async () => {
    // A 3-track EP order; claiming the free first master must drop it to a single
    // track with no add-ons, and the total reads Free.
    const cart = buildHydrationCart(3, EMPTY_ADDON_STATE);
    render(<CheckoutFlow initialCart={cart} flow={SEEDED_FLOW} />);
    expect(screen.getByText("EP")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: /Make it free/ }));
    // Now a Single (one track), and the sticky total reads Free.
    expect(screen.getByText("Single")).toBeInTheDocument();
    expect(screen.queryByText("EP")).not.toBeInTheDocument();
    const total = screen.getByText("Total").closest("div");
    expect(within(total as HTMLElement).getByText("Free")).toBeInTheDocument();
  });

  it("pages Review -> Details -> Send your tracks, contact before files", async () => {
    const cart = buildHydrationCart(2, EMPTY_ADDON_STATE);
    render(<CheckoutFlow initialCart={cart} flow={SEEDED_FLOW} />);
    await userEvent.click(screen.getByRole("button", { name: "Continue" }));
    // Contact details are their own step, before the upload.
    expect(
      screen.getByRole("heading", { name: "Your details" }),
    ).toBeInTheDocument();
    await userEvent.type(screen.getByLabelText("Name"), "Ada");
    await userEvent.type(screen.getByLabelText("Email"), "ada@studio.com");
    await userEvent.click(screen.getByRole("button", { name: "Continue" }));
    expect(
      screen.getByRole("heading", { name: "Send your tracks" }),
    ).toBeInTheDocument();
  });

  it("threads the details payer through upload into the pay step", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        ({ json: async () => ({ configured: false }) }) as unknown as Response,
      ),
    );
    const cart = buildHydrationCart(2, EMPTY_ADDON_STATE);
    render(<CheckoutFlow initialCart={cart} flow={SEEDED_FLOW} />);
    await userEvent.click(screen.getByRole("button", { name: "Continue" })); // -> details
    await userEvent.type(screen.getByLabelText("Name"), "Ada");
    await userEvent.type(screen.getByLabelText("Email"), "ada@studio.com");
    await userEvent.click(screen.getByRole("button", { name: "Continue" })); // -> upload

    const cta = screen.getByRole("button", { name: "Continue" });
    expect(cta).toBeDisabled();
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    await userEvent.upload(
      input,
      new File([new Uint8Array([1, 2, 3])], "track.wav", { type: "audio/wav" }),
    );
    await waitFor(() => expect(cta).toBeEnabled());
    await userEvent.click(cta); // -> notes

    // Notes is its own page before payment; optional, so Continue straight on.
    expect(
      screen.getByRole("heading", { name: "Anything else?" }),
    ).toBeInTheDocument();
    await userEvent.click(
      screen.getByRole("button", { name: "Continue to payment" }),
    );
    expect(screen.getByRole("button", { name: /^Pay/ })).toBeInTheDocument();
  });
});
