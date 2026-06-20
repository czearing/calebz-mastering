import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { Waveform } from "./Waveform";
import { makePeaks } from "./types";

describe("Waveform", () => {
  it("renders a single monochrome path body, not bars", () => {
    const { container } = render(<Waveform peaks={makePeaks(60, 3)} />);
    // Two paths: unplayed body and the cyan played overlay. No <rect> bars
    // beyond the clip mask. A spectrum would render dozens of bars.
    const paths = container.querySelectorAll("path");
    expect(paths.length).toBe(2);
  });

  it("shows the playhead only once playback has started", () => {
    const { container, rerender } = render(
      <Waveform peaks={makePeaks(60, 3)} progress={0} />,
    );
    expect(container.querySelector("line")).toBeNull();
    rerender(<Waveform peaks={makePeaks(60, 3)} progress={0.5} />);
    expect(container.querySelector("line")).not.toBeNull();
  });

  it("is hidden from the accessibility tree (wrapper carries semantics)", () => {
    const { container } = render(<Waveform peaks={makePeaks(10)} />);
    expect(container.querySelector("svg")).toHaveAttribute(
      "aria-hidden",
      "true",
    );
  });
});
