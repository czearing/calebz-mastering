import { describe, it, expect } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { Header } from "./Header";
import { nav } from "@/content";

// Header is navigation chrome: a labeled nav, the wordmark home anchor, the
// section anchors, and one Book affordance to #contact. Keep focused.
describe("Header", () => {
  it("exposes a labeled primary navigation landmark", () => {
    render(<Header />);
    expect(
      screen.getByRole("navigation", { name: "Primary" }),
    ).toBeInTheDocument();
  });

  it("links the wordmark back to the top of the page", () => {
    render(<Header />);
    expect(
      screen.getByRole("link", { name: nav.wordmark }),
    ).toHaveAttribute("href", "#hero");
  });

  it("renders an anchor for each section link", () => {
    render(<Header />);
    const region = screen.getByRole("navigation", { name: "Primary" });
    for (const link of nav.links) {
      expect(
        within(region).getByRole("link", { name: link.label }),
      ).toHaveAttribute("href", link.href);
    }
  });

  it("offers one primary affordance that anchors to the services console", () => {
    render(<Header />);
    expect(nav.book.label).toBe("Start a master");
    expect(
      screen.getByRole("link", { name: nav.book.label }),
    ).toHaveAttribute("href", "#services");
  });
});
