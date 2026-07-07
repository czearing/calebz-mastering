import type { AudioPair } from "./types";
import data from "./workAudio.json";

// Precomputed waveform peaks + loudness for the Work A/B players. Real,
// full-length before/after pairs (whole songs), measured with ffmpeg ebur128:
//   - down ("↓", Jexn Bxptiste): before -9.4 LUFS / +0.2 dBTP, after -9.3 / +0.2
//     (streaming upload vs CalebZ's master; two close masters, shown honestly).
//   - found-you ("Found You (CalebZ Remix)"): raw mix vs refmaster auto-master
//     (ref: Kygo "Higher Love"). before -15.6 / +0.3, after -10.2 / +0.1.
//   - bad-dream ("Bad Dream (CalebZ Remix)"): raw mix vs refmaster master toward
//     Skrillex "Scary Monsters" (tight-LRA heavy dubstep) with a raised limiting
//     budget (REFMASTER_MAX_LIMITING=4) + density (--max-reduction 6) so it
//     densifies to dubstep loudness instead of landing soft. before -12.5 / +1.0,
//     after -7.3 / +0.2 (crest 14.9->9.9, intro lifted ~1.7 dB, LRA 4.5, clean).
// ABPlayer.computeGain reads these LUFS to level-match the A/B so only the master
// differs on playback. Peaks are the per-window amplitude envelope on a shared
// scale, computed across the whole song.
//
// The peak arrays are bulky generated data, so they live in workAudio.json and
// are imported here only to attach the AudioPair type. Keeping the data out of
// this module keeps every source file small and the data trivially regenerable.
export const workAudio: Record<string, AudioPair> = data;
