import type { AudioSource as PlayerSource } from "@/components/audio/types";
import type { AudioSource as ContentSource } from "./types";

// Adapt a content AudioSource (flat lufs/truePeak) into the player's shape
// (nested loudness). Content stays terse; the player keeps its level-matching
// loudness object. One place owns the mapping so sections never repeat it.
export function toAudioSource(s: ContentSource): PlayerSource {
  return {
    src: s.src,
    peaks: s.peaks,
    loudness: { lufs: s.lufs, truePeak: s.truePeak },
  };
}
