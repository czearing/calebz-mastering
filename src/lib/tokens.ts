// Typed mirror of the CSS variable tokens in globals.css.
// Use these names when a value is needed in TS, for example three.js
// uniforms or canvas colors. Never hardcode hex or px elsewhere.

export const color = {
  bg: "var(--bg)",
  surface: "var(--surface)",
  line: "var(--line)",
  text: "var(--text)",
  muted: "var(--muted)",
  cyan: "var(--cyan)",
  cyanDim: "var(--cyan-dim)",
} as const;

// Raw hex values for non-CSS consumers, for example WebGL shaders.
export const colorHex = {
  bg: "#060708",
  surface: "#0E1113",
  line: "#1C2227",
  text: "#F4F6F7",
  muted: "#8A9499",
  cyan: "#00E5FF",
  cyanDim: "#0A8C9C",
} as const;

// 8px base scale, see plan/04.
export const space = [4, 8, 12, 16, 24, 32, 48, 64, 96, 128] as const;

export type ColorToken = keyof typeof color;
