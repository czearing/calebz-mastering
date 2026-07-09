import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { HeroActions } from "./HeroActions";

describe("HeroActions", () => {
  it("renders the primary action as a real link to selected work", () => {
    render(<HeroActions primaryAction="Start a master" />);
    const cta = screen.getByRole("link", { name: "Start a master" });
    expect(cta).toHaveAttribute("href", "#work");
  });

  it("honors an overridden services href", () => {
    render(
      <HeroActions primaryAction="Start a master" servicesHref="/#services" />,
    );
    expect(
      screen.getByRole("link", { name: "Start a master" }),
    ).toHaveAttribute("href", "/#services");
  });
});
