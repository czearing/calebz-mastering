import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

Object.defineProperty(HTMLCanvasElement.prototype, "getContext", {
  configurable: true,
  value: vi.fn(() => null),
});

const warn = console.warn.bind(console);
vi.spyOn(console, "warn").mockImplementation(
  (...args: Parameters<typeof console.warn>) => {
    if (String(args[0]).includes("Multiple instances of Three.js")) return;
    warn(...args);
  },
);
