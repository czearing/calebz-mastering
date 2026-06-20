import { makePeaks, type AudioSource } from "./types";

// TODO: placeholder assets. The user will replace these with real exports.
// Generated as ~3s tones with ffmpeg (before: quiet, lowpassed raw mix;
// after: fuller, louder master). Drop real previews at the same paths:
//   public/audio/sample-before.mp3
//   public/audio/sample-after.mp3
// Components take src and peaks via props, so only these constants change.
export const sampleBefore: AudioSource = {
  src: "/audio/sample-before.mp3",
  peaks: makePeaks(120, 7),
  // Placeholder numbers. Replace with the track's measured values.
  loudness: { lufs: -18.4, truePeak: -3.2 },
};

export const sampleAfter: AudioSource = {
  src: "/audio/sample-after.mp3",
  peaks: makePeaks(120, 23),
  loudness: { lufs: -9.6, truePeak: -1.0 },
};
