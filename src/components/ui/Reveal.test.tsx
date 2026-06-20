import { describe, it, expect, beforeAll } from "vitest";
import { render, screen } from "@testing-library/react";
import { Reveal } from "./Reveal";

// framer-motion reads window.matchMedia for prefers-reduced-motion and uses
// IntersectionObserver for whileInView. jsdom lacks both, so stub them.
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

  class MockIntersectionObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() {
      return [];
    }
  }
  Object.defineProperty(window, "IntersectionObserver", {
    writable: true,
    value: MockIntersectionObserver,
  });
  Object.defineProperty(globalThis, "IntersectionObserver", {
    writable: true,
    value: MockIntersectionObserver,
  });
});

describe("Reveal", () => {
  it("renders its children", () => {
    render(
      <Reveal>
        <p>Mastered, not loud.</p>
      </Reveal>,
    );
    expect(screen.getByText("Mastered, not loud.")).toBeInTheDocument();
  });

  it("renders the requested element tag", () => {
    render(
      <Reveal as="li">
        <span>Step</span>
      </Reveal>,
    );
    expect(screen.getByText("Step").closest("li")).toBeInTheDocument();
  });
});
