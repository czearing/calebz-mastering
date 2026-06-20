import { describe, it, expect, beforeAll } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Services } from "./Services";
import { consoleTotalCents, EMPTY_ADDON_STATE, formatUsd } from "@/lib/checkout";

// Reveal and the console hooks read matchMedia and IntersectionObserver in
// jsdom. Provide both. matchMedia returns matches:false so motion runs the
// non-reduced path; the math under test is independent of motion either way.
beforeAll(() => {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    }),
  });
  class MockIO {
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() {
      return [];
    }
  }
  Object.defineProperty(globalThis, "IntersectionObserver", {
    writable: true,
    value: MockIO,
  });
});

// The total is announced as plain dollars (no cents) in the live readout.
function dollars(cents: number): string {
  return formatUsd(cents).replace(".00", "");
}

describe("Services console", () => {
  it("renders the header copy and the live readout from the catalog", () => {
    render(<Services />);
    expect(
      screen.getByRole("heading", {
        level: 2,
        name: "Pay per track. The math does the rest.",
      }),
    ).toBeInTheDocument();
    // One track at the single rate, computed via the catalog.
    const expected = consoleTotalCents(1, EMPTY_ADDON_STATE);
    expect(screen.getAllByText(dollars(expected))[0]).toBeInTheDocument();
  });

  it("re-prices the whole release as the stepper crosses a tier", async () => {
    const user = userEvent.setup();
    render(<Services />);
    const add = screen.getByRole("button", { name: "Add one track" });

    await user.click(add); // 2 tracks, single
    await user.click(add); // 3 tracks, EP rate kicks in

    const epTotal = consoleTotalCents(3, EMPTY_ADDON_STATE);
    // The announced live region carries the exact tier and dollars.
    expect(
      screen.getByText(/EP, 174 dollars, 3 tracks/),
    ).toBeInTheDocument();
    expect(epTotal).toBe(17400);
  });

  it("snaps the stepper to a tier when its tile is clicked", async () => {
    const user = userEvent.setup();
    render(<Services />);
    const albumTile = screen.getByRole("button", { name: /^Album,/ });
    await user.click(albumTile);
    expect(
      screen.getByText(/Album, 300 dollars, 6 tracks/),
    ).toBeInTheDocument();
  });

  it("an add-on toggle changes the total", async () => {
    const user = userEvent.setup();
    render(<Services />);
    const stems = screen.getByRole("button", { name: /Stem mastering/ });
    await user.click(stems);
    expect(stems).toHaveAttribute("aria-pressed", "true");
    // 1 track $65 + stems $40 = $105.
    expect(
      screen.getByText(/Single, 105 dollars, 1 track/),
    ).toBeInTheDocument();
  });

  it("Atmos is excluded from the total but requested as a quote", async () => {
    const user = userEvent.setup();
    render(<Services />);
    const before = screen.getByText(/Single, 65 dollars, 1 track/);
    expect(before).toBeInTheDocument();
    const atmos = screen.getByRole("button", { name: /Dolby Atmos/ });
    await user.click(atmos);
    // Total unchanged, but the announcement now flags the quote.
    expect(
      screen.getByText(/Single, 65 dollars, 1 track, Atmos quote requested/),
    ).toBeInTheDocument();
  });

  it("serializes the configured order into the /start href", async () => {
    const user = userEvent.setup();
    render(<Services />);
    await user.click(screen.getByRole("button", { name: "Add one track" }));
    await user.click(screen.getByRole("button", { name: "Add one track" }));
    await user.click(screen.getByRole("button", { name: /Stem mastering/ }));
    const ctas = screen.getAllByRole("link", { name: /Continue to checkout|Checkout/ });
    for (const cta of ctas) {
      expect(cta.getAttribute("href")).toContain("/start?tracks=3");
      expect(cta.getAttribute("href")).toContain("stems=1");
    }
  });
});
