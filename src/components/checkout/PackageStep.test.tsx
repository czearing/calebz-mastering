import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PackageStep } from "./PackageStep";

function setup(trackCount: number, totalCents: number) {
  const onAddTrack = vi.fn();
  const onRemoveLast = vi.fn();
  const onNext = vi.fn();
  render(
    <PackageStep
      trackCount={trackCount}
      totalCents={totalCents}      onAddTrack={onAddTrack}
      onRemoveLast={onRemoveLast}
      onNext={onNext}
    />,
  );
  return { onAddTrack, onRemoveLast, onNext };
}

describe("PackageStep", () => {
  it("shows the per-track price live and what the count reads as", () => {
    // Three tracks falls in the EP tier at $58 per track.
    setup(3, 17400);
    expect(screen.getByText("EP")).toBeInTheDocument();
    expect(screen.getByText(/\$58\.00 per track/)).toBeInTheDocument();
    expect(screen.getByText(/\$174\.00 total/)).toBeInTheDocument();
  });

  it("invites the first track and disables continue when empty", () => {
    const { onNext } = setup(0, 0);
    expect(screen.getByText("Add your first track")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Continue" })).toBeDisabled();
    expect(onNext).not.toHaveBeenCalled();
  });

  it("adds a track when the action is pressed", async () => {
    const { onAddTrack } = setup(1, 6500);
    await userEvent.click(screen.getByRole("button", { name: "Add a track" }));
    expect(onAddTrack).toHaveBeenCalledOnce();
  });
});
