import { describe, expect, it } from "vitest";
import { analyzeAudioFile, formatSpec } from "./audioCheck";

// Build a minimal mono PCM WAV from normalised samples (-1..1) at a bit depth.
function makeWav(bits: 16 | 24, sampleRate: number, samples: number[]): File {
  const bytesPer = bits / 8;
  const dataLen = samples.length * bytesPer;
  const buf = new ArrayBuffer(44 + dataLen);
  const dv = new DataView(buf);
  const tag = (off: number, s: string) =>
    s.split("").forEach((c, i) => dv.setUint8(off + i, c.charCodeAt(0)));
  tag(0, "RIFF");
  dv.setUint32(4, 36 + dataLen, true);
  tag(8, "WAVE");
  tag(12, "fmt ");
  dv.setUint32(16, 16, true);
  dv.setUint16(20, 1, true); // PCM
  dv.setUint16(22, 1, true); // mono
  dv.setUint32(24, sampleRate, true);
  dv.setUint32(28, sampleRate * bytesPer, true);
  dv.setUint16(32, bytesPer, true);
  dv.setUint16(34, bits, true);
  tag(36, "data");
  dv.setUint32(40, dataLen, true);
  let o = 44;
  const full = bits === 16 ? 0x8000 : 0x800000;
  const max = full - 1;
  for (const v of samples) {
    const s = Math.max(-full, Math.min(max, Math.round(v * full)));
    if (bits === 16) {
      dv.setInt16(o, s, true);
      o += 2;
    } else {
      dv.setUint8(o, s & 0xff);
      dv.setUint8(o + 1, (s >> 8) & 0xff);
      dv.setUint8(o + 2, (s >> 16) & 0xff);
      o += 3;
    }
  }
  return new File([buf], "track.wav", { type: "audio/wav" });
}

const flat = (v: number, n = 64) => Array.from({ length: n }, () => v);

describe("analyzeAudioFile", () => {
  it("reads rate and bit depth and clears a clean 24-bit bounce", async () => {
    const c = await analyzeAudioFile(makeWav(24, 48000, flat(0.5)));
    expect(c.format).toBe("wav");
    expect(c.bitDepth).toBe(24);
    expect(c.sampleRate).toBe(48000);
    expect(c.peakDb).toBeCloseTo(-6, 0);
    expect(c.warnings).toHaveLength(0);
    expect(formatSpec(c)).toBe("24-bit · 48 kHz");
  });

  it("flags a clipped master as a clip heads-up", async () => {
    const c = await analyzeAudioFile(makeWav(24, 44100, flat(1)));
    expect(c.clipping).toBe(true);
    expect(c.warnings.map((w) => w.id)).toContain("clip");
    expect(formatSpec(c)).toBe("24-bit · 44.1 kHz");
  });

  it("flags a hot-but-not-clipped bounce as a hot heads-up", async () => {
    // ~-0.5 dBFS: hot, not at the ceiling.
    const c = await analyzeAudioFile(makeWav(24, 48000, flat(0.944)));
    expect(c.clipping).toBe(false);
    expect(c.warnings.map((w) => w.id)).toEqual(["hot"]);
  });

  it("flags a 16-bit file as a depth heads-up", async () => {
    const c = await analyzeAudioFile(makeWav(16, 48000, flat(0.5)));
    expect(c.bitDepth).toBe(16);
    expect(c.warnings.map((w) => w.id)).toContain("depth");
  });

  it("never cries wolf on a file it cannot read", async () => {
    const c = await analyzeAudioFile(new File(["not audio"], "notes.txt"));
    expect(c.format).toBe("unknown");
    expect(c.warnings).toHaveLength(0);
  });
});
