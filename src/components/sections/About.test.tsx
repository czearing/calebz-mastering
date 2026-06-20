import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { About } from "./About";
import { hero } from "@/content";

// "Meet CalebZ" founder block (plan/25): an own labeled section with the
// eyebrow, the founder note, the free-master offer, an informative portrait,
// and one Book affordance to #contact.
describe("About", () => {
  it("exposes a labeled region titled by the eyebrow", () => {
    render(<About />);
    expect(
      screen.getByRole("region", { name: "Meet CalebZ" }),
    ).toBeInTheDocument();
  });

  it("renders the founder note and the free-master offer from content", () => {
    render(<About />);
    expect(screen.getByText(hero.founderNote)).toBeInTheDocument();
    expect(screen.getByText(hero.offer)).toBeInTheDocument();
  });

  it("shows an informative portrait with real alt text", () => {
    render(<About />);
    const img = screen.getByRole("img", {
      name: /CalebZ, mastering engineer/i,
    });
    expect(img.getAttribute("src")).toMatch(/calebz-portrait\.jpg/);
  });

  it("offers one Book action that anchors to #contact", () => {
    render(<About />);
    expect(
      screen.getByRole("link", { name: hero.primaryAction }),
    ).toHaveAttribute("href", "#contact");
  });
});
