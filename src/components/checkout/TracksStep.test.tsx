import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { addTrack, emptyCart } from "@/lib/checkout";
import { TracksStep } from "./TracksStep";

const cart = addTrack(emptyCart(), "Night Drive");

function setup() {
  const props = {
    onRename: vi.fn(),
    onRemove: vi.fn(),
    onAddTrack: vi.fn(),
    onBack: vi.fn(),
    onNext: vi.fn(),
  };
  render(<TracksStep cart={cart} index={3} count={6} {...props} />);
  return props;
}

describe("TracksStep", () => {
  it("renders a labelled field per track with its title", () => {
    setup();
    expect(screen.getByLabelText("Track 1")).toHaveValue("Night Drive");
  });

  it("renames a track on input", async () => {
    const { onRename } = setup();
    await userEvent.type(screen.getByLabelText("Track 1"), "!");
    expect(onRename).toHaveBeenCalledWith("track-1", "Night Drive!");
  });

  it("adds another track", async () => {
    const { onAddTrack } = setup();
    await userEvent.click(
      screen.getByRole("button", { name: "Add another track" }),
    );
    expect(onAddTrack).toHaveBeenCalledOnce();
  });

  it("removes a track via its labelled control", async () => {
    const { onRemove } = setup();
    await userEvent.click(
      screen.getByRole("button", { name: "Remove track 1" }),
    );
    expect(onRemove).toHaveBeenCalledWith("track-1");
  });
});
