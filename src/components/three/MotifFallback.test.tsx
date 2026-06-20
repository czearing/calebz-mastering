import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { MotifFallback } from "./MotifFallback";
import { MotifCanvas } from "./MotifCanvas";

// We cannot assert WebGL pixels in jsdom, so we assert the degradation and
// accessibility contract instead: a static frame paints, it is decorative, and
// in a no-WebGL environment (jsdom) MotifCanvas never mounts a real canvas.
describe("MotifFallback", () => {
  it("renders a decorative static frame, hidden from assistive tech", () => {
    const { container } = render(<MotifFallback />);
    const frame = container.firstElementChild as HTMLElement;
    expect(frame).toBeTruthy();
    expect(frame).toHaveAttribute("aria-hidden", "true");
    // It paints a background, the cheap before-LCP frame.
    expect(frame.style.background).not.toBe("");
  });
});

describe("MotifCanvas degradation", () => {
  it("is decorative and never traps focus", () => {
    const { container } = render(<MotifCanvas />);
    const host = container.firstElementChild as HTMLElement;
    expect(host).toHaveAttribute("aria-hidden", "true");
    expect(host.getAttribute("tabindex")).toBeNull();
  });

  it("falls back to the static frame when WebGL is unavailable", () => {
    // jsdom has no GL context, so the guard must skip the Canvas entirely and
    // still paint the CSS frame. The page stays complete without the canvas.
    const { container } = render(<MotifCanvas />);
    expect(container.querySelector("canvas")).toBeNull();
    const frame = container.querySelector("[aria-hidden='true'] > div");
    expect(frame).toBeTruthy();
  });
});
