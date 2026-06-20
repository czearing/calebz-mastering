import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Section } from "./Section";

describe("Section", () => {
  it("renders a semantic section element with its children", () => {
    render(
      <Section>
        <p>Body copy</p>
      </Section>,
    );
    expect(screen.getByText("Body copy")).toBeInTheDocument();
  });

  it("renders the heading slot as a level-two heading", () => {
    render(<Section heading="Selected work">content</Section>);
    expect(
      screen.getByRole("heading", { level: 2, name: "Selected work" }),
    ).toBeInTheDocument();
  });

  it("forwards an id so it can be a scroll anchor", () => {
    const { container } = render(<Section id="work">content</Section>);
    expect(container.querySelector("section")).toHaveAttribute("id", "work");
  });
});
