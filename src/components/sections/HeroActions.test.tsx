import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HeroActions } from "./HeroActions";

const { track } = vi.hoisted(() => ({ track: vi.fn() }));
vi.mock("@vercel/analytics", () => ({ track }));

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

  it("tracks the work action", async () => {
    render(<HeroActions primaryAction="Hear the work" />);
    await userEvent.click(screen.getByRole("link", { name: "Hear the work" }));
    expect(track).toHaveBeenCalledWith("Work CTA Click");
  });
});
