// Pure, immutable cart helpers. No Math.random, no Date, no side effects.
// Track ids are deterministic so the same operations produce the same
// cart in any context (client live edit, server replay). See plan/29.

import type { AddonId, Cart, CartTrack } from "./types";

export function emptyCart(): Cart {
  return { tracks: [] };
}

// Deterministic id from existing ids. Find the largest numeric suffix
// already used and increment, so ids stay unique even after removals.
function nextTrackId(tracks: CartTrack[]): string {
  let max = 0;
  for (const track of tracks) {
    const match = /^track-(\d+)$/.exec(track.id);
    if (match) {
      const n = Number(match[1]);
      if (n > max) max = n;
    }
  }
  return `track-${max + 1}`;
}

// Append a new track. A caller may pass an explicit id (for example a
// nanoid minted at the edge); otherwise a deterministic id is derived.
export function addTrack(cart: Cart, title: string, id?: string): Cart {
  const track: CartTrack = {
    id: id ?? nextTrackId(cart.tracks),
    title,
    addons: {},
  };
  return { tracks: [...cart.tracks, track] };
}

export function removeTrack(cart: Cart, id: string): Cart {
  return { tracks: cart.tracks.filter((track) => track.id !== id) };
}

export function setTrackTitle(cart: Cart, id: string, title: string): Cart {
  return {
    tracks: cart.tracks.map((track) =>
      track.id === id ? { ...track, title } : track,
    ),
  };
}

// Set the quantity for one add-on on one track. A quantity of 0 (or
// less) removes the add-on key entirely so the cart stays clean.
export function setAddon(
  cart: Cart,
  trackId: string,
  addonId: AddonId,
  qty: number,
): Cart {
  const safeQty = Math.max(0, Math.trunc(qty));
  return {
    tracks: cart.tracks.map((track) => {
      if (track.id !== trackId) return track;
      const addons = { ...track.addons };
      if (safeQty <= 0) {
        delete addons[addonId];
      } else {
        addons[addonId] = safeQty;
      }
      return { ...track, addons };
    }),
  };
}
