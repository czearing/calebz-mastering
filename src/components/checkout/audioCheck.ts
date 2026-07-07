// Reads a dropped track and quietly checks the few things that actually hurt a
// master: clipped/too-hot peaks (no headroom, likely a limiter) and sub-24-bit
// depth. It parses the WAV header for rate/bit-depth and scans the front of the
// PCM for the true peak, no Web Audio, no full decode, so it is fast and runs
// the same in tests. Anything it cannot read (AIFF, compressed, odd headers)
// returns no warnings: we never cry wolf on a file we are not sure about.

export type AudioWarning = {
  id: "clip" | "hot" | "depth";
  title: string;
  detail: string;
};

export type AudioCheck = {
  format: "wav" | "aiff" | "unknown";
  sampleRate?: number;
  bitDepth?: number;
  peakDb?: number;
  clipping?: boolean;
  warnings: AudioWarning[];
};

type WavFmt = {
  audioFormat: number;
  channels: number;
  sampleRate: number;
  bitsPerSample: number;
  dataOffset: number;
  dataSize: number;
};

// Enough to reach the data chunk in any normal file; the peak scan reads the
// first ~6 MB of audio (tens of seconds), enough to catch a hot/limited master.
const HEADER_BYTES = 65_536;
const SCAN_BYTES = 6_000_000;

function ascii(b: Uint8Array, off: number, len: number): string {
  let s = "";
  for (let i = 0; i < len; i++) s += String.fromCharCode(b[off + i]);
  return s;
}

function parseWav(b: Uint8Array): WavFmt | null {
  if (b.length < 12 || ascii(b, 0, 4) !== "RIFF" || ascii(b, 8, 4) !== "WAVE") {
    return null;
  }
  const dv = new DataView(b.buffer, b.byteOffset, b.byteLength);
  let off = 12;
  let fmt: Omit<WavFmt, "dataOffset" | "dataSize"> | null = null;
  while (off + 8 <= b.length) {
    const id = ascii(b, off, 4);
    const size = dv.getUint32(off + 4, true);
    const body = off + 8;
    if (id === "fmt " && body + 16 <= b.length) {
      let audioFormat = dv.getUint16(body, true);
      // WAVE_FORMAT_EXTENSIBLE hides the real format in the sub-format GUID.
      if (audioFormat === 0xfffe && body + 26 <= b.length) {
        audioFormat = dv.getUint16(body + 24, true);
      }
      fmt = {
        audioFormat,
        channels: dv.getUint16(body + 2, true),
        sampleRate: dv.getUint32(body + 4, true),
        bitsPerSample: dv.getUint16(body + 14, true),
      };
    } else if (id === "data" && fmt) {
      return { ...fmt, dataOffset: body, dataSize: size };
    }
    off = body + size + (size & 1); // chunks are word-aligned
  }
  return null;
}

// True peak (0..1) and a count of full-scale samples across the scanned window.
function scanPeak(bytes: Uint8Array, fmt: WavFmt): { peak: number; clip: number } {
  const bps = fmt.bitsPerSample / 8;
  const isFloat = fmt.audioFormat === 3;
  if (![2, 3, 4].includes(bps)) return { peak: 0, clip: 0 };
  const dv = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const n = Math.floor(bytes.length / bps);
  let peak = 0;
  let clip = 0;
  for (let i = 0; i < n; i++) {
    const o = i * bps;
    let v: number;
    if (isFloat) v = dv.getFloat32(o, true);
    else if (bps === 2) v = dv.getInt16(o, true) / 0x8000;
    else if (bps === 3) {
      let s = bytes[o] | (bytes[o + 1] << 8) | (bytes[o + 2] << 16);
      if (s & 0x800000) s |= ~0xffffff;
      v = s / 0x800000;
    } else v = dv.getInt32(o, true) / 0x80000000;
    const a = v < 0 ? -v : v;
    if (a > peak) peak = a;
    if (a >= 0.999) clip++;
  }
  return { peak, clip };
}

function fmtDb(db?: number): string {
  if (db == null) return "0.0 dBFS";
  return `${db > 0 ? "+" : ""}${db.toFixed(1)} dBFS`;
}

function buildWarnings(c: AudioCheck): AudioWarning[] {
  const out: AudioWarning[] = [];
  const peak = c.peakDb ?? -120;
  if (c.clipping || peak >= -0.1) {
    out.push({
      id: "clip",
      title: "Sounds clipped",
      detail: `Peaks hit ${fmtDb(c.peakDb)}, right at the ceiling. Bounce with 3-6 dB of headroom and no master-bus limiter, so there's room to master.`,
    });
  } else if (peak >= -1) {
    out.push({
      id: "hot",
      title: "Peaks are hot",
      detail: `This bounce peaks at ${fmtDb(c.peakDb)}. Leaving 3-6 dB of headroom (and no limiter) gives the master more to work with.`,
    });
  }
  if (c.bitDepth && c.bitDepth < 24) {
    out.push({
      id: "depth",
      title: `${c.bitDepth}-bit file`,
      detail: "24-bit keeps more detail for mastering. 16-bit still works.",
    });
  }
  return out;
}

// A compact spec badge for a clean file row, e.g. "24-bit · 48 kHz".
export function formatSpec(c: AudioCheck): string | null {
  if (!c.bitDepth && !c.sampleRate) return null;
  const parts: string[] = [];
  if (c.bitDepth) parts.push(`${c.bitDepth}-bit`);
  if (c.sampleRate) parts.push(`${(c.sampleRate / 1000).toFixed(c.sampleRate % 1000 ? 1 : 0)} kHz`);
  return parts.join(" · ");
}

export async function analyzeAudioFile(file: File): Promise<AudioCheck> {
  try {
    const head = new Uint8Array(await file.slice(0, HEADER_BYTES).arrayBuffer());
    const fmt = parseWav(head);
    if (!fmt) {
      return { format: /\.aif/i.test(file.name) ? "aiff" : "unknown", warnings: [] };
    }
    const end = Math.min(file.size, fmt.dataOffset + Math.min(fmt.dataSize || Infinity, SCAN_BYTES));
    const data = new Uint8Array(await file.slice(fmt.dataOffset, end).arrayBuffer());
    const { peak, clip } = scanPeak(data, fmt);
    const check: AudioCheck = {
      format: "wav",
      sampleRate: fmt.sampleRate,
      bitDepth: fmt.bitsPerSample,
      peakDb: peak > 0 ? Math.round(20 * Math.log10(peak) * 10) / 10 : -120,
      clipping: clip >= 8,
      warnings: [],
    };
    check.warnings = buildWarnings(check);
    return check;
  } catch {
    return { format: "unknown", warnings: [] };
  }
}
