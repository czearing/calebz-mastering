import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useScrollSignal } from "./useScrollSignal";

// Drive a controllable rAF so we can step the loop deterministically and assert
// the normalized progress and the damped velocity math without a real browser.
let frame: FrameRequestCallback | null = null;

function step() {
  const cb = frame;
  frame = null;
  if (cb) act(() => cb(performance.now()));
}

function setScroll(scrollY: number, scrollHeight = 2000, innerHeight = 1000) {
  Object.defineProperty(document.documentElement, "scrollHeight", {
    value: scrollHeight,
    configurable: true,
  });
  Object.defineProperty(window, "innerHeight", {
    value: innerHeight,
    configurable: true,
  });
  Object.defineProperty(window, "scrollY", {
    value: scrollY,
    configurable: true,
  });
}

describe("useScrollSignal", () => {
  beforeEach(() => {
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((cb) => {
      frame = cb;
      return 1;
    });
    vi.spyOn(window, "cancelAnimationFrame").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
    frame = null;
  });

  it("is SSR safe: starts at zero before any frame runs", () => {
    setScroll(0);
    const { result } = renderHook(() => useScrollSignal());
    expect(result.current.progress).toBe(0);
    expect(result.current.velocity).toBe(0);
  });

  it("normalizes scrollY to 0..1 over the scrollable range", () => {
    // 500 of a 1000px scrollable range is the midpoint.
    setScroll(500);
    const { result } = renderHook(() => useScrollSignal());
    act(() => window.dispatchEvent(new Event("scroll")));
    step();
    expect(result.current.progress).toBeCloseTo(0.5, 5);
  });

  it("clamps progress to 1 at the bottom and 0 at the top", () => {
    setScroll(99999);
    const { result } = renderHook(() => useScrollSignal());
    act(() => window.dispatchEvent(new Event("scroll")));
    step();
    expect(result.current.progress).toBe(1);
  });

  it("returns 0 progress when content is not scrollable", () => {
    setScroll(0, 800, 1000);
    const { result } = renderHook(() => useScrollSignal());
    act(() => window.dispatchEvent(new Event("scroll")));
    step();
    expect(result.current.progress).toBe(0);
  });

  it("produces a nonzero damped velocity after a scroll delta", () => {
    setScroll(0);
    const { result } = renderHook(() => useScrollSignal());
    setScroll(400);
    act(() => window.dispatchEvent(new Event("scroll")));
    step();
    // delta 0.4 smoothed by 0.2 gain => 0.08, signed positive (scrolling down).
    expect(result.current.velocity).toBeGreaterThan(0);
    expect(result.current.velocity).toBeCloseTo(0.08, 5);
  });
});
