import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ADDONS } from "@/lib/checkout";
import { AddonChip } from "./AddonChip";

const stems = ADDONS.find((a) => a.id === "stems")!;
const altVersion = ADDONS.find((a) => a.id === "altVersion")!;
const atmos = ADDONS.find((a) => a.id === "atmos")!;

describe("AddonChip", () => {
  it("renders a per-track add-on as an aria-pressed toggle and flips it on", async () => {
    const onChange = vi.fn();
    render(<AddonChip addon={stems} qty={0} onChange={onChange} />);
    const toggle = screen.getByRole("button", { pressed: false });
    expect(toggle).toHaveTextContent(stems.label);
    expect(screen.getByText(/\+\$40\.00 per track/)).toBeInTheDocument();
    await userEvent.click(toggle);
    expect(onChange).toHaveBeenCalledWith(1);
  });

  it("reflects the on state via aria-pressed", () => {
    render(<AddonChip addon={stems} qty={1} onChange={() => {}} />);
    expect(screen.getByRole("button", { pressed: true })).toBeInTheDocument();
  });

  it("exposes a quantity stepper for per-item add-ons", async () => {
    const onChange = vi.fn();
    render(<AddonChip addon={altVersion} qty={2} onChange={onChange} />);
    await userEvent.click(
      screen.getByRole("button", { name: `Add one ${altVersion.label}` }),
    );
    expect(onChange).toHaveBeenCalledWith(3);
    await userEvent.click(
      screen.getByRole("button", { name: `Remove one ${altVersion.label}` }),
    );
    expect(onChange).toHaveBeenCalledWith(1);
  });

  it("marks the quote-only add-on", () => {
    render(<AddonChip addon={atmos} qty={0} onChange={() => {}} />);
    expect(screen.getByText(/quote only/)).toBeInTheDocument();
  });
});
