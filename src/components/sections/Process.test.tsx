import { describe, it, expect, beforeAll } from "vitest";
import { render, screen } from "@testing-library/react";
import { Process } from "./Process";

// framer-motion (via Reveal) reads matchMedia and IntersectionObserver; jsdom
// lacks both, so stub them before rendering.
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
  Object.defineProperty(window, "IntersectionObserver", {
    writable: true,
    value: MockIO,
  });
  Object.defineProperty(globalThis, "IntersectionObserver", {
    writable: true,
    value: MockIO,
  });
});

describe("Process", () => {
  it("renders the heading and every step as a list item", () => {
    render(<Process />);
    expect(
      screen.getByRole("heading", { name: "How it works" }),
    ).toBeInTheDocument();
    const items = screen.getAllByRole("listitem");
    expect(items).toHaveLength(4);
  });

  it("renders the step text from content", () => {
    render(<Process />);
    expect(
      screen.getByText(/private link so you can hear the full master/i),
    ).toBeInTheDocument();
  });

  it("anchors the section by id for in-page navigation", () => {
    const { container } = render(<Process />);
    expect(container.querySelector("section#process")).toBeInTheDocument();
  });
});
