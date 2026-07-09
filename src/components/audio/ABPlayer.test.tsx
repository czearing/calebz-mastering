import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ABPlayer } from "./ABPlayer";
import { sampleBefore, sampleAfter } from "./sample";
import { installAudioStub } from "./testAudio";

const { trackEvent } = vi.hoisted(() => ({ trackEvent: vi.fn() }));
vi.mock("@vercel/analytics", () => ({ track: trackEvent }));

// Capture every audio element the AB engine creates so we can assert the
// gapless, level-matched switch without a real media engine.
let elements: HTMLAudioElement[];

beforeEach(() => {
  trackEvent.mockClear();
  elements = installAudioStub();
});

afterEach(() => vi.restoreAllMocks());

describe("ABPlayer", () => {
  it("loads duration metadata without autoplay", async () => {
    render(<ABPlayer before={sampleBefore} after={sampleAfter} />);
    expect(elements).toHaveLength(1);
    expect(elements[0].play).not.toHaveBeenCalled();
    expect(
      screen.getByText(
        (_, element) =>
          element?.tagName === "P" && element.textContent === "0:00 / 0:03",
      ),
    ).toBeInTheDocument();
    await userEvent.click(
      screen.getByRole("button", { name: "Hear the difference" }),
    );
    expect(elements).toHaveLength(3);
  });

  it("offers a mono BEFORE and AFTER toggle as a radiogroup", () => {
    render(<ABPlayer before={sampleBefore} after={sampleAfter} />);
    const group = screen.getByRole("radiogroup");
    expect(within(group).getByRole("radio", { name: "Before" })).toBeChecked();
    expect(
      within(group).getByRole("radio", { name: "After" }),
    ).not.toBeChecked();
  });

  it("switches sides gaplessly at the same playhead position", async () => {
    render(<ABPlayer before={sampleBefore} after={sampleAfter} />);
    await userEvent.click(
      screen.getByRole("button", { name: "Hear the difference" }),
    );
    const [before, after] = elements.slice(-2);
    before.currentTime = 1.5;
    await userEvent.click(screen.getByRole("radio", { name: "After" }));
    // The newly audible side is aligned to the playhead, not restarted.
    expect(after.currentTime).toBe(1.5);
  });

  it("plays the master (after) at full loudness; before is not boosted", async () => {
    render(<ABPlayer before={sampleBefore} after={sampleAfter} />);
    await userEvent.click(
      screen.getByRole("button", { name: "Hear the difference" }),
    );
    // Switch so the after source becomes the audible one and carries its gain.
    await userEvent.click(screen.getByRole("radio", { name: "After" }));
    const [before, after] = elements.slice(-2);
    // after LUFS (-9.6) is the loudest side → it plays at full unity (the real
    // product loudness), never pulled down to the quiet raw before (-18.4).
    expect(after.volume).toBe(1);
    expect(before.volume).toBe(0);
  });

  it("shows the sound-off proof: LUFS and true peak numbers", () => {
    render(<ABPlayer before={sampleBefore} after={sampleAfter} />);
    expect(screen.getByText(/-18\.4 LUFS/)).toBeInTheDocument();
    expect(screen.getByText(/-9\.6 LUFS/)).toBeInTheDocument();
    expect(screen.getByText(/-1\.0 dBTP/)).toBeInTheDocument();
  });

  it("tracks play and A/B switches", async () => {
    render(
      <ABPlayer
        before={sampleBefore}
        after={sampleAfter}
        analyticsId="first-light"
      />,
    );
    await userEvent.click(
      screen.getByRole("button", { name: "Hear the difference" }),
    );
    await userEvent.click(screen.getByRole("radio", { name: "After" }));
    expect(trackEvent).toHaveBeenCalledWith("Track Play", {
      track: "first-light",
    });
    expect(trackEvent).toHaveBeenCalledWith("A/B Switch", {
      track: "first-light",
      side: "after",
    });
  });
});
