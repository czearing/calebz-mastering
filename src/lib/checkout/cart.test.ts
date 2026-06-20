// Cart helper tests: determinism and immutability.

import { describe, it, expect } from "vitest";
import {
  emptyCart,
  addTrack,
  removeTrack,
  setTrackTitle,
  setAddon,
} from "./cart";

describe("emptyCart", () => {
  it("starts with no tracks", () => {
    expect(emptyCart()).toEqual({ tracks: [] });
  });
});

describe("addTrack", () => {
  it("appends a track with a deterministic id", () => {
    const c1 = addTrack(emptyCart(), "First");
    expect(c1.tracks).toHaveLength(1);
    expect(c1.tracks[0].id).toBe("track-1");
    const c2 = addTrack(c1, "Second");
    expect(c2.tracks[1].id).toBe("track-2");
  });

  it("accepts an explicit id when provided", () => {
    const c = addTrack(emptyCart(), "Edge", "abc123");
    expect(c.tracks[0].id).toBe("abc123");
  });

  it("never reuses an id after a removal", () => {
    let cart = addTrack(emptyCart(), "A");
    cart = addTrack(cart, "B");
    cart = removeTrack(cart, "track-1");
    cart = addTrack(cart, "C");
    const ids = cart.tracks.map((t) => t.id);
    expect(ids).toEqual(["track-2", "track-3"]);
  });

  it("does not mutate the input cart", () => {
    const original = emptyCart();
    addTrack(original, "First");
    expect(original.tracks).toHaveLength(0);
  });
});

describe("removeTrack", () => {
  it("removes by id without mutating the input", () => {
    const c1 = addTrack(addTrack(emptyCart(), "A"), "B");
    const c2 = removeTrack(c1, "track-1");
    expect(c2.tracks.map((t) => t.id)).toEqual(["track-2"]);
    expect(c1.tracks).toHaveLength(2);
  });
});

describe("setTrackTitle", () => {
  it("updates only the matching track immutably", () => {
    const c1 = addTrack(emptyCart(), "Old");
    const c2 = setTrackTitle(c1, "track-1", "New");
    expect(c2.tracks[0].title).toBe("New");
    expect(c1.tracks[0].title).toBe("Old");
    expect(c2.tracks[0]).not.toBe(c1.tracks[0]);
  });
});

describe("setAddon", () => {
  it("sets a quantity immutably", () => {
    const c1 = addTrack(emptyCart(), "A");
    const c2 = setAddon(c1, "track-1", "altVersion", 2);
    expect(c2.tracks[0].addons.altVersion).toBe(2);
    expect(c1.tracks[0].addons.altVersion).toBeUndefined();
  });

  it("removes the add-on key when quantity is zero", () => {
    let cart = addTrack(emptyCart(), "A");
    cart = setAddon(cart, "track-1", "stems", 1);
    expect(cart.tracks[0].addons.stems).toBe(1);
    cart = setAddon(cart, "track-1", "stems", 0);
    expect(cart.tracks[0].addons.stems).toBeUndefined();
    expect("stems" in cart.tracks[0].addons).toBe(false);
  });

  it("clamps negative and fractional quantities", () => {
    let cart = addTrack(emptyCart(), "A");
    cart = setAddon(cart, "track-1", "extraFormat", 2.9);
    expect(cart.tracks[0].addons.extraFormat).toBe(2);
    cart = setAddon(cart, "track-1", "extraFormat", -5);
    expect(cart.tracks[0].addons.extraFormat).toBeUndefined();
  });

  it("leaves other tracks untouched", () => {
    let cart = addTrack(addTrack(emptyCart(), "A"), "B");
    cart = setAddon(cart, "track-1", "stems", 1);
    expect(cart.tracks[1].addons).toEqual({});
  });
});
