import { vi } from "vitest";

// jsdom ships no media engine. This installs a constructable Audio stub
// (an arrow function cannot be used with `new`) that returns a real <audio>
// element with play and pause stubbed and a fixed duration, plus a registry
// of every element created so tests can assert on the dual AB sources.
export function installAudioStub(duration = 3) {
  const created: HTMLAudioElement[] = [];
  vi.spyOn(window, "Audio").mockImplementation(function () {
    const el = document.createElement("audio") as HTMLAudioElement;
    el.play = vi.fn().mockResolvedValue(undefined);
    el.pause = vi.fn();
    el.load = vi.fn();
    Object.defineProperty(el, "duration", {
      value: duration,
      configurable: true,
    });
    created.push(el);
    return el;
  } as unknown as () => HTMLAudioElement);
  return created;
}
