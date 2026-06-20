import { makePeaks } from "@/components/audio/types";
import type { AudioPair } from "./types";

// TODO: PLACEHOLDER AUDIO. Every track and the hero point at the two demo
// files below so audio plays in the demo. The user must replace these with
// the real raw mix and finished master per track, and drop them in
// public/audio/. Swap the src strings here (and the measured lufs/truePeak,
// and the baked peaks) once real exports exist. No real audio is wired yet.
const PLACEHOLDER_BEFORE = "/audio/sample-before.mp3"; // TODO: replace per track
const PLACEHOLDER_AFTER = "/audio/sample-after.mp3"; // TODO: replace per track

// Build a placeholder before/after pair. Peaks are deterministic filler seeded
// per track so each waveform reads as its own; lufs/truePeak are placeholder
// numbers the user must replace with the track's measured values.
export function placeholderPair(seed: number): AudioPair {
  return {
    before: {
      src: PLACEHOLDER_BEFORE, // TODO: replace with the real raw mix
      peaks: makePeaks(120, seed),
      lufs: -18.4, // TODO: replace with measured integrated loudness
      truePeak: -3.2, // TODO: replace with measured true peak
    },
    after: {
      src: PLACEHOLDER_AFTER, // TODO: replace with the real finished master
      peaks: makePeaks(120, seed + 17),
      lufs: -9.6, // TODO: replace with measured integrated loudness
      truePeak: -1.0, // TODO: replace with measured true peak
    },
  };
}
