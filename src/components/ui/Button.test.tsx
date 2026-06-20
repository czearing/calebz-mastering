import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "./Button";

// Test pattern for every UI primitive: render, role, an interaction,
// and an a11y-relevant attribute. Keep focused, under 80 lines.
describe("Button", () => {
  it("renders an accessible button with its label", () => {
    render(<Button>Book a master</Button>);
    expect(
      screen.getByRole("button", { name: "Book a master" }),
    ).toBeInTheDocument();
  });

  it("defaults to type button so it never submits a form by accident", () => {
    render(<Button>Press play</Button>);
    expect(screen.getByRole("button")).toHaveAttribute("type", "button");
  });

  it("calls onClick when pressed", async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Switch</Button>);
    await userEvent.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("does not fire when disabled", async () => {
    const onClick = vi.fn();
    render(
      <Button disabled onClick={onClick}>
        Send inquiry
      </Button>,
    );
    await userEvent.click(screen.getByRole("button"));
    expect(onClick).not.toHaveBeenCalled();
  });
});
