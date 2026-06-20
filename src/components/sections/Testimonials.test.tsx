import { describe, it, expect, beforeAll } from "vitest";
import { render, screen } from "@testing-library/react";
import { Testimonials } from "./Testimonials";

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
  Object.defineProperty(window, "IntersectionObserver", { writable: true, value: MockIO });
  Object.defineProperty(globalThis, "IntersectionObserver", { writable: true, value: MockIO });
});

const filled = {
  title: "What artists say",
  items: [
    { id: "r1", quote: "Loud and clean on every system.", name: "Mara Vance", project: "Glasshouse EP" },
    { id: "r2", quote: "Translated perfectly to phone speakers.", name: "Devon Ruiz", project: "Nightline Records" },
  ],
};

describe("Testimonials", () => {
  it("renders each review with name, project, and quote", () => {
    render(<Testimonials content={filled} />);
    expect(screen.getByText("Loud and clean on every system.")).toBeInTheDocument();
    expect(screen.getByText("Mara Vance")).toBeInTheDocument();
    expect(screen.getByText("Glasshouse EP")).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
  });

  it("renders nothing when there are no reviews", () => {
    const { container } = render(
      <Testimonials content={{ title: "What artists say", items: [] }} />,
    );
    expect(container).toBeEmptyDOMElement();
  });
});
