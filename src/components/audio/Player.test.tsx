import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Player } from "./Player";
import { sampleAfter } from "./sample";
import { installAudioStub } from "./testAudio";

// jsdom does not implement media playback (see testAudio).
let created: HTMLAudioElement[];

beforeEach(() => {
  created = installAudioStub();
});

afterEach(() => vi.restoreAllMocks());

describe("Player", () => {
  it("exposes a labeled play control and a seek slider", () => {
    render(
      <Player src={sampleAfter.src} peaks={sampleAfter.peaks} title="X" />,
    );
    expect(screen.getByRole("button", { name: "Play" })).toBeInTheDocument();
    expect(screen.getByRole("slider", { name: "Seek X" })).toBeInTheDocument();
  });

  it("does not stream audio until the first explicit play", async () => {
    render(<Player src={sampleAfter.src} peaks={sampleAfter.peaks} />);
    // No engine constructed on render (lazy init, plan/11).
    expect(window.Audio).not.toHaveBeenCalled();
    await userEvent.click(screen.getByRole("button", { name: "Play" }));
    expect(window.Audio).toHaveBeenCalledOnce();
  });

  it("seek slider is keyboard operable once a duration is known", async () => {
    render(<Player src={sampleAfter.src} peaks={sampleAfter.peaks} />);
    // Start playback so the engine exists, then announce its duration.
    await userEvent.click(screen.getByRole("button", { name: "Play" }));
    act(() => created[0].dispatchEvent(new Event("durationchange")));
    const slider = screen.getByRole("slider");
    slider.focus();
    expect(slider).toHaveAttribute("aria-valuenow", "0");
    await userEvent.keyboard("{End}");
    expect(slider).toHaveAttribute("aria-valuenow", "100");
  });
});
