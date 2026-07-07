import { describe, it, expect, vi, beforeAll } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  addTrack,
  cartTotalCents,
  emptyCart,
  quoteOnly,
  reviewSummary,
  setAddon,
} from "@/lib/checkout";
import { SummaryStep } from "./SummaryStep";

// TrackStepper uses pointer autorepeat timers; jsdom needs matchMedia for the
// reduced-motion check nowhere here, but provide it for safety with the console
// controls reused in this step.
beforeAll(() => {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: () => ({
      matches: false,
      addEventListener: () => {},
      removeEventListener: () => {},
    }),
  });
});

// A 2-track Single tier order with a per-track rush add-on on track 1.
const cart = setAddon(
  addTrack(addTrack(emptyCart(), "Night Drive"), "Afterglow"),
  "track-1",
  "rush",
  1,
);

function setup(onBack?: () => void, hasStems = false, free = false) {
  const onNext = vi.fn();
  const onEditCart = vi.fn();
  const onSetFree = vi.fn();
  render(
    <SummaryStep
      summary={reviewSummary(cart)}
      totalCents={cartTotalCents(cart)}
      isQuote={quoteOnly(cart)}
      cart={cart}
      hasStems={hasStems}
      free={free}
      onSetFree={onSetFree}
      onEditCart={onEditCart}
      onBack={onBack}
      onNext={onNext}
    />,
  );
  return { onNext, onEditCart, onSetFree };
}

describe("SummaryStep", () => {
  it("groups the order into a tier header line, not N identical rows", () => {
    setup();
    expect(
      screen.getByRole("heading", { name: "Review your order" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Single")).toBeInTheDocument();
    expect(screen.getByText(/2 tracks, \$65\.00 per track/)).toBeInTheDocument();
  });

  it("shows the add-on in the order summary", () => {
    setup();
    // Rush appears in the priced summary card (and again as an editor toggle).
    expect(screen.getAllByText(/Rush, 24 to 48h/).length).toBeGreaterThan(0);
  });

  it("keeps the order total always visible in the sticky bar", () => {
    setup();
    const total = screen.getByText("Total").closest("div");
    expect(within(total as HTMLElement).getByText("$160.00")).toBeInTheDocument();
  });

  it("continues to the next step", async () => {
    const { onNext } = setup();
    await userEvent.click(screen.getByRole("button", { name: "Continue" }));
    expect(onNext).toHaveBeenCalledOnce();
  });

  it("omits Back when it is the first step (no onBack)", () => {
    setup();
    expect(
      screen.queryByRole("button", { name: "Back" }),
    ).not.toBeInTheDocument();
  });

  it("never uses the word console anywhere customer-facing", () => {
    const { container } = render(
      <SummaryStep
        summary={reviewSummary(cart)}
        totalCents={cartTotalCents(cart)}
        isQuote={quoteOnly(cart)}
        cart={cart}
        free={false}
        onSetFree={() => {}}
        onEditCart={() => {}}
        onNext={() => {}}
      />,
    );
    expect(container.textContent?.toLowerCase()).not.toContain("console");
  });

  it("offers the first master free and toggles free mode on click", async () => {
    const { onSetFree } = setup();
    await userEvent.click(screen.getByRole("button", { name: /Make it free/ }));
    expect(onSetFree).toHaveBeenCalledWith(true);
  });

  it("reads Free instead of a dollar total in free mode", () => {
    setup(undefined, false, true);
    const total = screen.getByText("Total").closest("div");
    expect(within(total as HTMLElement).getByText("Free")).toBeInTheDocument();
    expect(
      within(total as HTMLElement).queryByText("$160.00"),
    ).not.toBeInTheDocument();
  });

  it("locks the order controls in free mode (one track, no add-ons)", () => {
    setup(undefined, false, true);
    // The add-track button is disabled (capped at one), and the add-ons ledger
    // is disabled via its fieldset, so a free master cannot grow into a paid one.
    expect(screen.getByRole("button", { name: "Add one track" })).toBeDisabled();
    expect(screen.getByRole("button", { name: /Stem mastering/ })).toBeDisabled();
  });

  it("edits the order in place instead of navigating away", async () => {
    const { onEditCart } = setup();
    // No page link out; the order is changed right here.
    expect(
      screen.queryByRole("link", { name: /change your order/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Change your order" }),
    ).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Add one track" }));
    expect(onEditCart).toHaveBeenCalled();
  });

  it("explains stem mastering only when stems are in the cart", () => {
    setup(undefined, true);
    expect(screen.getByText(/Stem mastering means/)).toBeInTheDocument();
  });

  it("omits the stem explanation when there are no stems", () => {
    setup();
    expect(screen.queryByText(/Stem mastering means/)).not.toBeInTheDocument();
  });
});
