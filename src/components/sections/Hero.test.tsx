import { describe, it, expect, beforeAll, afterEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";

// next/dynamic pulls in the R3F canvas chunk. The motif is decorative and the
// page must read without it, so stub the dynamic loader to render nothing here.
vi.mock("next/dynamic", () => ({
  default: () =>
    function MockMotif() {
      return null;
    },
}));

import { Hero } from "./Hero";
import { hero } from "@/content";

// jsdom lacks matchMedia and IntersectionObserver, which framer-motion (Reveal)
// reads for reduced motion and whileInView. Stub both.
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

afterEach(() => vi.restoreAllMocks());

describe("Hero", () => {
  it("renders the signature headline as the level-one heading", () => {
    render(<Hero />);
    expect(
      screen.getByRole("heading", { level: 1, name: hero.headline }),
    ).toBeInTheDocument();
  });

  it("offers one primary action that anchors to selected work", () => {
    render(<Hero />);
    const cta = screen.getByRole("link", { name: hero.primaryAction });
    expect(cta).toHaveAttribute("href", "#work");
  });

  it("no longer carries the founder note; it moved to the About section", () => {
    render(<Hero />);
    // The founder note lives in the "Meet CalebZ" section now (plan/25), so the
    // hero stays the statement alone and never duplicates it.
    expect(screen.queryByText(hero.founderNote)).not.toBeInTheDocument();
  });

  it("says the headline once (the H1 only)", () => {
    render(<Hero />);
    // "Hear the difference." is the H1 only; the before/after proof now lives in
    // the Work section, so the hero never repeats the line.
    expect(
      screen.getByRole("heading", { level: 1, name: hero.headline }),
    ).toBeInTheDocument();
  });
});
