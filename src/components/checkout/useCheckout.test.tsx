import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useCheckout, SEEDED_FLOW } from "./useCheckout";

describe("useCheckout", () => {
  it("starts empty on the package step in the full flow", () => {
    const { result } = renderHook(() => useCheckout());
    expect(result.current.step).toBe("package");
    expect(result.current.trackCount).toBe(0);
    expect(result.current.totalCents).toBe(0);
    expect(result.current.stepCount).toBe(7);
  });

  it("prices live as tracks are added and crosses tiers", () => {
    const { result } = renderHook(() => useCheckout());
    act(() => result.current.addTrack("One"));
    expect(result.current.totalCents).toBe(6500); // single tier
    act(() => {
      result.current.addTrack("Two");
      result.current.addTrack("Three");
    });
    // Three tracks re-price the whole release at the EP rate, $58 each.
    expect(result.current.totalCents).toBe(17400);
  });

  it("flags a quote-only cart when Atmos is on", () => {
    const { result } = renderHook(() => useCheckout());
    act(() => result.current.addTrack("One"));
    act(() => result.current.setAddon("track-1", "atmos", 1));
    expect(result.current.isQuote).toBe(true);
  });

  it("runs the seeded 4-step flow starting on Review", () => {
    const { result } = renderHook(() => useCheckout(undefined, SEEDED_FLOW));
    expect(result.current.step).toBe("summary");
    expect(result.current.index).toBe(0);
    expect(result.current.stepCount).toBe(4);
  });

  it("pages the seeded flow Review -> Upload -> Pay -> Confirm and stops", () => {
    const { result } = renderHook(() => useCheckout(undefined, SEEDED_FLOW));
    act(() => result.current.next());
    expect(result.current.step).toBe("upload");
    act(() => result.current.next());
    expect(result.current.step).toBe("payment");
    act(() => result.current.next());
    expect(result.current.step).toBe("confirm");
    act(() => result.current.next());
    expect(result.current.step).toBe("confirm"); // no overrun past the last step
  });

  it("never reveals the builder steps in the seeded flow", () => {
    const { result } = renderHook(() => useCheckout(undefined, SEEDED_FLOW));
    act(() => result.current.back());
    // Back from the first step stays on Review, never the builder steps.
    expect(result.current.step).toBe("summary");
    expect(["package", "addons", "tracks"]).not.toContain(result.current.step);
  });

  it("exposes a grouped review summary for the Review step", () => {
    const { result } = renderHook(() => useCheckout());
    act(() => result.current.addTrack(""));
    expect(result.current.review.trackCount).toBe(1);
    expect(result.current.review.tier).toBe("Single");
  });

  it("moves forward and back through the full flow without overrun", () => {
    const { result } = renderHook(() => useCheckout());
    act(() => result.current.back());
    expect(result.current.index).toBe(0);
    act(() => {
      result.current.next();
      result.current.next();
    });
    expect(result.current.step).toBe("tracks");
    act(() => result.current.goTo("confirm"));
    expect(result.current.step).toBe("confirm");
    act(() => result.current.next());
    expect(result.current.step).toBe("confirm");
  });
});
