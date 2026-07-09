import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { About } from "./About";
import { hero } from "@/content";

describe("About", () => {
  it("exposes a labeled founder region", () => {
    render(<About />);
    expect(
      screen.getByRole("region", { name: "Caleb Zearing" }),
    ).toBeInTheDocument();
  });

  it("renders the founder note without a sales offer", () => {
    render(<About />);
    expect(screen.getByText(hero.founderNote)).toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("shows an informative portrait with real alt text", () => {
    render(<About />);
    const img = screen.getByRole("img", {
      name: /CalebZ, mastering engineer/i,
    });
    expect(img.getAttribute("src")).toMatch(/calebz-portrait\.jpg/);
  });
});
