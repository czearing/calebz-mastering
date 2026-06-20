import { describe, it, expect } from "vitest";
import { DataTexture } from "three";
import { generateTerrain } from "./terrainData";

// The placeholder terrain must be deterministic (so renders and tests are
// stable) and produce a normalized single-channel height field. When the real
// baked track texture replaces it, these invariants still hold.
describe("generateTerrain", () => {
  it("returns a square single-channel DataTexture of the given size", () => {
    const tex = generateTerrain(32);
    expect(tex).toBeInstanceOf(DataTexture);
    expect(tex.image.width).toBe(32);
    expect(tex.image.height).toBe(32);
  });

  it("fills every texel with a normalized 0..1 height", () => {
    const tex = generateTerrain(16);
    const data = tex.image.data as Float32Array;
    expect(data.length).toBe(16 * 16);
    for (const h of data) {
      expect(h).toBeGreaterThanOrEqual(0);
      expect(h).toBeLessThanOrEqual(1);
    }
  });

  it("is deterministic across calls so renders never flicker", () => {
    const a = generateTerrain(16).image.data as Float32Array;
    const b = generateTerrain(16).image.data as Float32Array;
    expect(Array.from(a)).toEqual(Array.from(b));
  });

  it("is not flat: the surface carries real variation", () => {
    const data = generateTerrain(32).image.data as Float32Array;
    const min = Math.min(...Array.from(data));
    const max = Math.max(...Array.from(data));
    expect(max - min).toBeGreaterThan(0.1);
  });
});
