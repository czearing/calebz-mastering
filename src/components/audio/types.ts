// Shared types for the audio module. Components take all data via props,
// never hardcode a src. Peaks are a precomputed, normalised amplitude
// envelope (0..1) so the Waveform never runs a live FFT (see plan/05, 11).

// Integrated loudness and true peak for the sound-off proof (plan/13).
// These numbers are shown, not just heard, so a deaf visitor reaches
// the same conclusion as a listener.
export type Loudness = {
  // Integrated loudness in LUFS, for example -14.0.
  lufs: number;
  // True peak in dBTP, for example -1.0.
  truePeak: number;
};

// One audio source: a streamable url plus its visual proof.
export type AudioSource = {
  src: string;
  // Normalised peak envelope, one value per column (0..1).
  peaks: number[];
  // Optional loudness readout for the sound-off proof.
  loudness?: Loudness;
};

// Build an evenly spaced fake envelope for stories and tests. The real
// peaks are baked offline from the track; this is deterministic filler.
export function makePeaks(count: number, seed = 1): number[] {
  const out: number[] = [];
  let x = seed;
  for (let i = 0; i < count; i += 1) {
    // Cheap deterministic pseudo-noise, shaped by a slow envelope so the
    // waveform reads like audio, not a flat block.
    x = (x * 9301 + 49297) % 233280;
    const noise = x / 233280;
    const env = Math.sin((i / count) * Math.PI);
    out.push(Math.max(0.04, Math.min(1, env * (0.4 + noise * 0.6))));
  }
  return out;
}
