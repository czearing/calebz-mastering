import { describe, it, expect, vi, afterEach } from "vitest";
import { hasWebGL, cappedDpr, prefersReducedMotion } from "./webgl";

// Pure guard logic. These are the branches that decide whether the heavy canvas
// mounts at all, so they get the most coverage. Pixels are out of scope in
// jsdom; the guards are not.
describe("webgl guards", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("reports no WebGL in jsdom, which forces the static fallback path", () => {
    // jsdom canvas has no GL context, so this is the real degraded path.
    expect(hasWebGL()).toBe(false);
  });

  it("reports WebGL when a context is available", () => {
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(
      {} as unknown as RenderingContext,
    );
    expect(hasWebGL()).toBe(true);
  });

  it("never returns true if getContext throws", () => {
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockImplementation(
      () => {
        throw new Error("context blocked");
      },
    );
    expect(hasWebGL()).toBe(false);
  });

  it("caps dpr at 1.5 even on a high density display", () => {
    vi.stubGlobal("devicePixelRatio", 3);
    expect(cappedDpr()).toBe(1.5);
    vi.unstubAllGlobals();
  });

  it("passes through a low dpr unchanged", () => {
    vi.stubGlobal("devicePixelRatio", 1);
    expect(cappedDpr()).toBe(1);
    vi.unstubAllGlobals();
  });

  it("reads prefers-reduced-motion from matchMedia", () => {
    vi.stubGlobal(
      "matchMedia",
      () => ({ matches: true }) as MediaQueryList,
    );
    expect(prefersReducedMotion()).toBe(true);
    vi.unstubAllGlobals();
  });

  it("defaults reduced motion to false when not requested", () => {
    vi.stubGlobal(
      "matchMedia",
      () => ({ matches: false }) as MediaQueryList,
    );
    expect(prefersReducedMotion()).toBe(false);
    vi.unstubAllGlobals();
  });

  it("treats a browser without matchMedia as no reduced-motion", () => {
    // jsdom ships no matchMedia, the real guard path. Must not throw.
    expect(prefersReducedMotion()).toBe(false);
  });
});
