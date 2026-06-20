import { describe, it, expect, beforeAll, beforeEach, vi } from "vitest";
import { render } from "@testing-library/react";
import { act } from "react";
import { ScrollCue } from "./ScrollCue";

// jsdom drives no rAF or scroll naturally; stub a synchronous rAF so the cue's
// throttled loop runs once on demand, and reset scrollY between tests.
beforeAll(() => {
  vi.stubGlobal(
    "requestAnimationFrame",
    (cb: FrameRequestCallback) => setTimeout(() => cb(0), 0) as unknown as number,
  );
  vi.stubGlobal("cancelAnimationFrame", (id: number) =>
    clearTimeout(id as unknown as NodeJS.Timeout),
  );
});

beforeEach(() => {
  Object.defineProperty(window, "scrollY", {
    configurable: true,
    writable: true,
    value: 0,
  });
});

function flush() {
  // Let the stubbed rAF callbacks fire.
  return act(async () => {
    await new Promise((r) => setTimeout(r, 0));
  });
}

describe("ScrollCue", () => {
  it("is decorative: aria-hidden and not focusable", () => {
    const { container } = render(<ScrollCue />);
    const root = container.firstElementChild as HTMLElement;
    expect(root).toHaveAttribute("aria-hidden", "true");
    expect(root.className).toContain("pointer-events-none");
    // No interactive descendants, nothing tabbable.
    expect(container.querySelector("a, button, [tabindex]")).toBeNull();
  });

  it("is visible at the top of the page", async () => {
    const { container } = render(<ScrollCue />);
    await flush();
    const root = container.firstElementChild as HTMLElement;
    expect(root.style.opacity).toBe("1");
  });

  it("retires once scrolled past the threshold", async () => {
    const { container } = render(<ScrollCue />);
    (window as unknown as { scrollY: number }).scrollY = 200;
    window.dispatchEvent(new Event("scroll"));
    await flush();
    const root = container.firstElementChild as HTMLElement;
    expect(root.style.opacity).toBe("0");
  });

  it("returns to rest back at the top", async () => {
    const { container } = render(<ScrollCue />);
    (window as unknown as { scrollY: number }).scrollY = 200;
    window.dispatchEvent(new Event("scroll"));
    await flush();
    (window as unknown as { scrollY: number }).scrollY = 0;
    window.dispatchEvent(new Event("scroll"));
    await flush();
    const root = container.firstElementChild as HTMLElement;
    expect(root.style.opacity).toBe("1");
  });
});
