import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useAudio } from "./useAudio";
import { installAudioStub } from "./testAudio";

// The key behaviour under test is that the engine is created lazily on
// first play, never on mount (plan/11).
let created: HTMLAudioElement[];

beforeEach(() => {
  created = installAudioStub();
});

afterEach(() => vi.restoreAllMocks());

describe("useAudio", () => {
  it("does not create the audio engine on mount", () => {
    renderHook(() => useAudio("/audio/sample-after.mp3"));
    expect(created.length).toBe(0);
  });

  it("creates the engine and plays on first play", async () => {
    const { result } = renderHook(() => useAudio("/audio/sample-after.mp3"));
    await act(async () => {
      await result.current.play();
    });
    expect(created.length).toBe(1);
    expect(created[0].play).toHaveBeenCalledOnce();
    expect(created[0].preload).toBe("none");
  });

  it("seek clamps and updates currentTime", async () => {
    const { result } = renderHook(() => useAudio("/audio/sample-after.mp3"));
    act(() => result.current.seek(-5));
    expect(result.current.currentTime).toBe(0);
  });
});
