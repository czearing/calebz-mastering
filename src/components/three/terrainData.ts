import { DataTexture, RedFormat, FloatType, LinearFilter } from "three";

// PLACEHOLDER terrain data.
//
// Real implementation: this single-channel height field is baked offline from
// the actual CalebZ track. X is time (the playhead axis), Y is frequency band,
// the red channel is normalized magnitude. The BEFORE and AFTER passes are two
// such bakes (raw mix and finished master) and ship as a static asset, for
// example a 256x256 RG texture where R = before height, G = after height.
// Until that bake exists we synthesize a plausible spectrogram-like surface so
// the shader, morph and guards can be built and tested. Replace generateTerrain
// with a texture loader pointing at the baked asset. No live FFT, ever.

const SIZE = 128;

// Cheap deterministic value noise so the texture is stable across renders and
// reproducible in tests. Not Perlin, just enough structure to read as terrain.
function hash(x: number, y: number): number {
  const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return n - Math.floor(n);
}

function smoothNoise(x: number, y: number): number {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const xf = x - xi;
  const yf = y - yi;
  const u = xf * xf * (3 - 2 * xf);
  const v = yf * yf * (3 - 2 * yf);
  const a = hash(xi, yi);
  const b = hash(xi + 1, yi);
  const c = hash(xi, yi + 1);
  const d = hash(xi + 1, yi + 1);
  return a * (1 - u) * (1 - v) + b * u * (1 - v) + c * (1 - u) * v + d * u * v;
}

// Fractal sum, then a gentle ridge so the AFTER surface reads tighter than a
// pure noise field. Returns 0..1.
function fbm(x: number, y: number): number {
  let sum = 0;
  let amp = 0.5;
  let freq = 1;
  for (let o = 0; o < 4; o++) {
    sum += smoothNoise(x * freq, y * freq) * amp;
    freq *= 2;
    amp *= 0.5;
  }
  return Math.min(1, Math.max(0, sum));
}

export function generateTerrain(size = SIZE): DataTexture {
  const data = new Float32Array(size * size);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const u = (x / size) * 5;
      const v = (y / size) * 5;
      // Bias height toward the lower frequency rows so it reads like a
      // spectrogram, loudest at the bottom.
      const band = 1 - y / size;
      data[y * size + x] = fbm(u, v) * (0.4 + 0.6 * band);
    }
  }
  // FloatType matches the Float32Array data so three uploads it via a float
  // texImage path instead of warning about a non-Uint8Array buffer.
  const tex = new DataTexture(data, size, size, RedFormat, FloatType);
  tex.minFilter = LinearFilter;
  tex.magFilter = LinearFilter;
  tex.needsUpdate = true;
  return tex;
}
